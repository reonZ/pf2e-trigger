import {
    Blueprint,
    BlueprintDropDocument,
    BlueprintMenu,
    BlueprintNode,
    BlueprintWaitContextData,
    EntryField,
    HorizontalLayoutGraphics,
    LayoutGraphicsPadding,
} from "blueprint";
import {
    createEntryId,
    entriesAreCompatible,
    getEntryLabel,
    NodeEntryCategory,
    NodeEntryId,
    NodeEntryType,
    NodeEntryValue,
    NonBridgeEntryType,
    TriggerData,
} from "data";
import { confirmDialog, R } from "module-helpers";
import { BaseNodeSchemaEntry, hasInputConnector, NodeCustomEntryCategory } from "schema";

const ENTRY_PADDING = [0, 2] as LayoutGraphicsPadding;

class BlueprintEntry extends HorizontalLayoutGraphics {
    #category: NodeEntryCategory;
    #connector: PIXI.Graphics | undefined;
    #field: EntryField | undefined;
    #node: BlueprintNode;
    #schema: BaseNodeSchemaEntry;
    #id: NodeEntryId;

    static UNLABELED_ENTRIES: NodeEntryType[] = ["select", "text", "uuid"];

    static CONNECTOR_COLOR: Record<NodeEntryType, number> = {
        boolean: 0xad0303,
        bridge: 0xffffff,
        dc: 0x1682c9,
        duration: 0x75db32,
        effect: 0xe100ff,
        item: 0x696fe0,
        list: 0x874501,
        number: 0x07b88f,
        roll: 0x86910d,
        select: 0xe0a06c,
        target: 0xff3075,
        text: 0xe0a06c,
        uuid: 0x696fe0,
    };

    constructor(node: BlueprintNode, category: NodeEntryCategory, schema: BaseNodeSchemaEntry) {
        super({ spacing: 5, maxHeight: node.entryHeight, padding: [0, 2] });

        this.#node = node;
        this.#schema = schema;
        this.#category = category;
        this.#id = createEntryId(node, category, this.key);

        const children = [
            (this.#connector = this.#drawConnector()),
            this.#drawLabel(),
            (this.#field = this.#drawField()),
        ];

        const order = category === "inputs" ? children : R.reverse(children);

        this.addChild(...order.filter(R.isTruthy));

        if (this.#connector) {
            if (this.isBridge) {
                this.#connector.y += 0.5;
            } else if (this.isCustom) {
                this.#connector.x += category === "inputs" ? -0 : 1;
                this.#connector.y += 1;
            } else {
                this.#connector.x += category === "inputs" ? -0.5 : 1.5;
                this.#connector.y += 1;
            }
        }
    }

    get id(): NodeEntryId {
        return this.#id;
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

    get trigger(): TriggerData | undefined {
        return this.blueprint.trigger;
    }

    get category(): NodeEntryCategory {
        return this.#category;
    }

    get customCategory(): NodeCustomEntryCategory {
        return this.isInput ? "inputs" : this.isBridge ? "outs" : "outputs";
    }

    get isInput(): boolean {
        return this.category === "inputs";
    }

    get isOutput(): boolean {
        return this.category === "outputs";
    }

    get oppositeCategory(): NodeEntryCategory {
        return this.isInput ? "outputs" : "inputs";
    }

    get schema(): BaseNodeSchemaEntry {
        return this.#schema;
    }

    get value(): NodeEntryValue {
        return this.node.getValue(this.key);
    }

    get hasInputConnector(): boolean {
        return hasInputConnector(this.node, this.node.schema);
    }

    get connections(): NodeEntryId[] {
        return this.node.getConnections(this.id);
    }

    get connected(): boolean {
        return this.connections.length > 0;
    }

    get canConnect(): boolean {
        if (!this.#connector) {
            return false;
        }

        return (
            (this.isInput && (this.isBridge || !this.connected)) ||
            (this.isOutput && (!this.isBridge || !this.connected))
        );
    }

    get connectorColor(): number {
        return getConnectorColor(this.type);
    }

    get connectorCenter(): Point {
        if (!this.#connector) {
            return { x: 0, y: 0 };
        }

        const bounds = this.#connector.getBounds();

        return {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
        };
    }

    get connectorOffset(): Point {
        if (!this.#connector) {
            return { x: 0, y: 0 };
        }

        const center = this.connectorCenter;
        const bounds = this.node.getBounds();

        return {
            x: center.x - bounds.x,
            y: center.y - bounds.y,
        };
    }

    get label(): string {
        if (this.isOutput && this.node.isGetter) {
            const targetLabel = this.node.targetLabel;
            if (targetLabel) {
                return targetLabel;
            }
        }

        const schema = this.schema;
        return getEntryLabel(schema, this.node.data);
    }

    get contextEntries(): EntryContextData[] {
        const entries: EntryContextData[] = [];

        if (this.isCustom) {
            entries.push({ value: "delete-entry" });
        }

        if (this.isOutput && !this.isBridge && !this.node.isVariable && !this.node.isEvent) {
            if (this.trigger?.getVariable(this.id)) {
                entries.push({ value: "delete-variable" }, { value: "edit-variable" });
            } else {
                entries.push({ value: "create-variable" });
            }
        }

        if (this.connected) {
            entries.push({ value: "disconnect" });
        }

        return entries;
    }

    get isBridge(): boolean {
        return this.type === "bridge";
    }

    get isCustom(): boolean {
        return this.node.isCustom && !!this.schema.custom;
    }

    get opacity(): number {
        return this.node.opacity;
    }

    onDropDocument(point: Point, type: string, document: BlueprintDropDocument): boolean | null {
        if (!this.contains(point)) {
            return false;
        }

        if (!this.connected) {
            this.#field?.onDropDocument(type, document);
        }

        return true;
    }

    isConnectedTo(other: BlueprintEntry | NodeEntryId): boolean {
        return this.connections.includes(other instanceof BlueprintEntry ? other.id : other);
    }

    isCompatibleWith(other: BlueprintEntry): boolean {
        return entriesAreCompatible(this, other);
    }

    canConnectTo(other: BlueprintEntry): boolean {
        return (
            // we prevent nodes from connecting to self
            this.node.id !== other.node.id &&
            // we prevent variables from connecting to each others (getter & setter)
            (!this.node.data.target || this.node.data.target !== other.node.data.target) &&
            this.canConnect &&
            !this.isConnectedTo(other) &&
            this.isCompatibleWith(other)
        );
    }

    contains({ x, y }: Point): boolean {
        return this.getBounds().contains(x, y);
    }

    testConnection(point: Point, other: BlueprintEntry): boolean {
        return this.contains(point) && this.canConnectTo(other);
    }

    #drawLabel(): PreciseText | undefined {
        if (
            this.isOutput ||
            this.node.isSplitter ||
            !BlueprintEntry.UNLABELED_ENTRIES.includes(this.type)
        ) {
            return this.node.preciseText(this.label);
        }
    }

    #drawField(): EntryField | undefined {
        if (this.isInput && !this.node.isSplitter && EntryField.ALLOWED_TYPES.includes(this.type)) {
            return new EntryField(this);
        }
    }

    #drawConnector(): PIXI.Graphics | undefined {
        if (this.isInput && !this.hasInputConnector) return;

        const connector = new PIXI.Graphics();
        const color = this.connectorColor;

        connector.eventMode = "static";
        connector.hitArea = new PIXI.Rectangle(0, 0, 12, 12);
        connector.on("pointerdown", this.#onConnectorPointerDown, this);

        if (this.connected) {
            connector.beginFill(color);
        }

        if (this.isBridge) {
            connector.lineStyle({ color, width: 1 });
            connector.moveTo(0, 0);
            connector.lineTo(6, 0);
            connector.lineTo(12, 6);
            connector.lineTo(6, 12);
            connector.lineTo(0, 12);
            connector.lineTo(0, 0);
        } else if (this.isCustom) {
            connector.lineStyle({ color, width: 2 });
            connector.drawRoundedRect(0, 0, 12.5, 12.5, 2.5);
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

        const value = result.value;

        if (value === "create-variable") {
            this.blueprint.createVariable(this as BlueprintEntry & { type: NonBridgeEntryType });
        } else if (value === "delete-entry") {
            this.#delete();
        } else if (value === "delete-variable") {
            this.blueprint.deleteVariable(this.id);
        } else if (value === "disconnect") {
            this.node.data.disconnect(this.id);
            this.blueprint.refresh();
        } else if (value === "edit-variable") {
            this.blueprint.editVariable(this.id);
        }
    }

    async #delete() {
        const result = await confirmDialog("delete-entry", {
            skipAnimate: true,
            data: { name: this.schema.label },
        });

        if (result) {
            this.node.data?.removeCustomEntry(this.customCategory, this.schema);
            this.blueprint.refresh();
        }
    }
}

function getConnectorColor(type: NonNullable<NodeEntryType>, hex: true): string;
function getConnectorColor(type: NonNullable<NodeEntryType>, hex?: false): number;
function getConnectorColor(type: NonNullable<NodeEntryType>, hex?: boolean): number | string {
    const decimal = BlueprintEntry.CONNECTOR_COLOR[type];
    return hex ? decimal.toString(16).padStart(6, "0") : decimal;
}

type EntryContextValue =
    | "create-variable"
    | "delete-variable"
    | "edit-variable"
    | "disconnect"
    | "delete-entry";

type EntryContextData = BlueprintWaitContextData<EntryContextValue> & {
    label?: string;
};

export { BlueprintEntry, ENTRY_PADDING, getConnectorColor };
