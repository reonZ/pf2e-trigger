import {
    Blueprint,
    BlueprintMenu,
    BlueprintNode,
    EntryField,
    HorizontalLayoutGraphics,
} from "blueprint";
import {
    NodeEntryCategory,
    NodeEntryId,
    NodeEntryType,
    NodeEntryValue,
    TriggerEntryData,
} from "data";
import { localize, localizeIfExist, R } from "module-helpers";
import { COMPATIBLE_ENTRIES, NodeRawSchemaEntry } from "schema";

const CONNECTOR_COLOR: Record<NodeEntryType, number> = {
    boolean: 0xad0303,
    bridge: 0xffffff,
    dc: 0x1682c9,
    duration: 0x75db32,
    item: 0x696fe0,
    list: 0x874501,
    number: 0x07b88f,
    roll: 0x86910d,
    select: 0xe0a06c,
    target: 0xff3075,
    text: 0xe0a06c,
};

class BlueprintEntry extends HorizontalLayoutGraphics {
    #category: NodeEntryCategory;
    #connector: PIXI.Graphics;
    #node: BlueprintNode;
    #schema: EntrySchema;
    #field: EntryField | undefined;
    #label: PreciseText | undefined;

    constructor(node: BlueprintNode, category: NodeEntryCategory, schema: EntrySchema) {
        super({ spacing: 5, maxHeight: node.entryHeight, padding: [0, 2] });

        this.#node = node;
        this.#schema = schema;
        this.#category = category;

        const children = [
            (this.#connector = this.#drawConnector()),
            (this.#label = this.#drawLabel()),
            (this.#field = this.#drawField()),
        ];

        const order = category === "inputs" ? children : R.reverse(children);

        this.addChild(...order.filter(R.isTruthy));

        if (this.type === "bridge") {
            this.#connector.y += 1;
        } else {
            this.#connector.x += category === "inputs" ? -1.5 : 1.5;
            this.#connector.y += 1.5;
        }
    }

    get id(): NodeEntryId {
        return `${this.node.id}.${this.category}.${this.key}`;
    }

    get type(): NodeEntryType {
        return this.schema.type;
    }

    get key(): string {
        return this.schema.key;
    }

    get node(): BlueprintNode {
        return this.#node;
    }

    get blueprint(): Blueprint {
        return this.node.blueprint;
    }

    get category(): NodeEntryCategory {
        return this.#category;
    }

    get oppositeCategory(): NodeEntryCategory {
        return this.category === "inputs" ? "outputs" : "inputs";
    }

    get schema(): EntrySchema {
        return this.#schema;
    }

    get localizePath(): string {
        return `${this.node.localizePath}.entry`;
    }

    get value(): NodeEntryValue {
        return this.node.getValue(this.id);
    }

    get connections(): NodeEntryId[] {
        return this.node.getConnections(this.id);
    }

    get connected(): boolean {
        return this.connections.length > 0;
    }

    get canConnect(): boolean {
        if (this.node.type === "event" && this.category === "inputs") {
            return false;
        }

        return (
            (this.category === "inputs" && (this.type === "bridge" || !this.connected)) ||
            (this.category === "outputs" && (this.type !== "bridge" || !this.connected))
        );
    }

    get connectorColor(): number {
        return CONNECTOR_COLOR[this.type];
    }

    get connectorCenter(): Point {
        const bounds = this.#connector.getBounds();
        return {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
        };
    }

    get connectorOffset(): Point {
        const center = this.connectorCenter;
        const bounds = this.node.getBounds();

        return {
            x: center.x - bounds.x,
            y: center.y - bounds.y,
        };
    }

    get label(): string {
        const schema = this.schema;
        return schema.label
            ? localizeIfExist(schema.label) ?? game.i18n.localize(schema.label)
            : localizeIfExist(this.localizePath, schema.key) ?? localize("entry", schema.key);
    }

    get contextEntries(): EntryContextValue[] {
        const entries: EntryContextValue[] = [];

        if (this.connected) {
            entries.push("disconnect");
        }

        return entries;
    }

    get field(): EntryField | undefined {
        return this.#field;
    }

    update(data: UpdateData<TriggerEntryData>) {
        if ("value" in data && R.isNullish(data.value)) {
            delete data.value;
            data["-=value"] = null;
        }

        this.node.update({
            [this.category]: {
                [this.key]: data,
            },
        });
    }

    addConnection(other: BlueprintEntry | NodeEntryId) {
        const connections = this.connections;
        connections.push(other instanceof BlueprintEntry ? other.id : other);
        this.update({ ids: R.unique(connections) });
    }

    removeConnection(other: BlueprintEntry | NodeEntryId) {
        const otherid = other instanceof BlueprintEntry ? other.id : other;
        const connections = this.connections;
        const removed = connections.findSplice((id) => id === otherid);

        if (removed) {
            this.update({ ids: R.unique(connections) });
        }
    }

    disconnect(skipSelf?: boolean) {
        const toRefresh: BlueprintEntry[] = [];

        for (const otherId of this.connections) {
            const other = this.blueprint.getEntry(otherId);
            if (!other) continue;

            toRefresh.push(other);
            other.removeConnection(this);
            this.blueprint.connectionsLayer.remove(this, other);
        }

        if (!skipSelf) {
            toRefresh.push(this);
            this.update({ ids: [] });
        }

        for (const entry of toRefresh) {
            entry.refreshConnector();
        }
    }

    isConnectedTo(other: BlueprintEntry | NodeEntryId): boolean {
        return this.connections.includes(other instanceof BlueprintEntry ? other.id : other);
    }

    isCompatibleWith(other: BlueprintEntry | NodeEntryType): boolean {
        const otherType = other instanceof BlueprintEntry ? other.type : other;

        if (this.type === otherType) {
            return true;
        }

        return !!COMPATIBLE_ENTRIES[this.type]?.includes(otherType);
    }

    canConnectTo(other: BlueprintEntry): boolean {
        return (
            this.category !== other.category &&
            this.node.id !== other.node.id &&
            this.canConnect &&
            !this.isConnectedTo(other) &&
            this.isCompatibleWith(other)
        );
    }

    testContains({ x, y }: Point): boolean {
        return this.getBounds().contains(x, y);
    }

    testConnection(point: Point, other: BlueprintEntry): boolean {
        return this.testContains(point) && this.canConnectTo(other);
    }

    refreshConnector() {
        this.#connector?.clear();
        this.#drawConnector(this.#connector);
        this.#field?.refresh();
    }

    #drawLabel(): PreciseText | undefined {
        switch (this.type) {
            case "select":
            case "text": {
                return;
            }

            default: {
                return this.node.preciseText(this.label);
            }
        }
    }

    #drawField(): EntryField | undefined {
        if (this.category === "outputs" || !EntryField.ALLOWED_TYPES.includes(this.type)) return;
        return new EntryField(this);
    }

    #drawConnector(connector = new PIXI.Graphics()): PIXI.Graphics {
        const color = this.connectorColor;

        connector.eventMode = "static";
        connector.hitArea = new PIXI.Rectangle(0, 0, 12, 12);
        connector.on("pointerdown", this.#onConnectorPointerDown, this);

        if (this.connected) {
            connector.beginFill(color);
        }

        if (this.type === "bridge") {
            connector.lineStyle({ color, width: 1 });
            connector.moveTo(0, 0);
            connector.lineTo(6, 0);
            connector.lineTo(12, 6);
            connector.lineTo(6, 12);
            connector.lineTo(0, 12);
            connector.lineTo(0, 0);
        } else {
            connector.lineStyle({ color, width: 2 });
            connector.drawCircle(6, 6, 6.5);
        }

        connector.endFill();

        return connector;
    }

    #onConnectorPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        if (event.button === 0 && this.canConnect) {
            this.blueprint.connectionsLayer.start(this);
        } else if (event.button === 2) {
            this.#onContextMenu(event);
        }
    }

    async #onContextMenu(event: PIXI.FederatedPointerEvent) {
        const { x, y } = event.global;
        const result = await BlueprintMenu.waitContext(this.blueprint, this.contextEntries, x, y);
        if (!result) return;

        switch (result.value) {
            case "add-variable": {
                break;
            }

            case "remove-variable": {
                break;
            }

            case "disconnect": {
                this.disconnect();
                break;
            }
        }
    }
}

type EntryContextValue = "add-variable" | "remove-variable" | "disconnect";

type EntrySchema = NodeRawSchemaEntry<NodeEntryType>;

export { BlueprintEntry };
export type { EntrySchema };
