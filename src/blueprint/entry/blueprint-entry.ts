import { Blueprint } from "blueprint/blueprint";
import { BlueprintSelectMenu } from "blueprint/menu/bluprint-menu-select";
import { BlueprintNode } from "blueprint/node/blueprint-node";
import { haveCompatibleEntryType, segmentEntryId } from "data/data-entry";
import { localize, localizeIfExist } from "module-helpers";
import { BlueprintBridgeEntry } from "./blueprint-entry-bridge";

const ENTRY_COLORS: Record<NonNullable<NodeEntryType>, number> = {
    boolean: 0x940404,
    dc: 0x1682c9,
    duration: 0x75db32,
    item: 0x696fe0,
    number: 0x07b88f,
    roll: 0x86910d,
    select: 0xf79442,
    target: 0xf5115d,
    text: 0xf79442,
    uuid: 0xf79442,
    label: 0x000000,
};

abstract class BlueprintEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends PIXI.Graphics {
    #schema: NonNullable<NodeSchema[TCategory]>[number];
    #category: TCategory;
    #node: BlueprintNode;
    #connector: PIXI.Graphics | null;
    #label: PIXI.Container | PreciseText | PIXI.Graphics;

    constructor(
        category: TCategory,
        node: BlueprintNode,
        schema: NonNullable<NodeSchema[TCategory]>[number]
    ) {
        super();

        this.#node = node;
        this.#schema = schema;
        this.#category = category;

        this.#connector = this.#createConnector();
        this.#label = this.addChild(this._createLabel());

        this._positionChildren();
    }

    abstract get canConnect(): boolean;
    protected abstract _fillConnector(connector: PIXI.Graphics): void;

    get connectorComponent(): PIXI.Graphics | null {
        return this.#connector;
    }

    get labelComponent(): PIXI.Container | PIXI.Graphics | PreciseText {
        return this.#label;
    }

    get schema(): NonNullable<NodeSchema[TCategory]>[number] {
        return this.#schema;
    }

    get type(): NodeEntryType {
        // @ts-expect-error
        return this.#schema.type;
    }

    get node(): BlueprintNode {
        return this.#node;
    }

    get blueprint(): Blueprint {
        return this.node.blueprint;
    }

    get category(): TCategory {
        return this.#category;
    }

    get oppositeCategory(): NodeEntryCategory {
        return this.category === "inputs" ? "outputs" : "inputs";
    }

    get key(): string {
        return this.#schema.key;
    }

    get id(): NodeEntryId {
        const node = this.node;
        return `${node.id}.${this.category}.${this.key}`;
    }

    get connections(): NodeEntryId[] {
        return (this.node.data[this.category][this.key]?.ids ?? []).filter((id) => {
            const { nodeId, category, key } = segmentEntryId(id);
            const connections = this.blueprint.trigger?.nodes[nodeId]?.[category]?.[key]?.ids;
            return connections?.includes(this.id);
        });
    }

    get connectorColor(): number {
        const type = this.type;
        return type ? ENTRY_COLORS[type] : 0xffffff;
    }

    get isActive(): boolean {
        return this.hasConnector && this.connections.length > 0;
    }

    get label(): string {
        const path = "node.entry";
        const label = "label" in this.#schema ? this.#schema.label : undefined;
        const key = this.key ?? this.category;

        return label
            ? localizeIfExist(path, label) ?? game.i18n.localize(label)
            : localizeIfExist(this.node.localizePath, key, "label") ?? localize(path, key);
    }

    get rowHeight(): number {
        return this.node.rowHeight;
    }

    get spacing(): number {
        return 5;
    }

    get hasConnector(): boolean {
        return true;
    }

    get connectorCenter(): Point {
        const bounds = this.#connector?.getBounds();

        if (!bounds) {
            return { x: 0, y: 0 };
        }

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

    initialize() {}

    refreshConnector() {
        this.#connector?.clear();
        this.#fillConnector();
    }

    isBridgeEntry(): this is BlueprintBridgeEntry {
        return !this.type;
    }

    canConnectTo(other: BlueprintEntry): boolean {
        return (
            !!this.#connector &&
            this.category !== other.category &&
            this.node.id !== other.node.id &&
            haveCompatibleEntryType(this, other) &&
            this.canConnect &&
            !(other.id in this.connections)
        );
    }

    onConnect({ x, y }: Point, other: BlueprintEntry): this | undefined {
        const canConnect = this.canConnectTo(other);
        return canConnect && this.getBounds().contains(x, y) ? this : undefined;
    }

    addConnection(id: NodeEntryId) {
        const connections = this.connections;
        connections.push(id);

        fu.setProperty(this.node.data, `${this.category}.${this.key}.ids`, connections);
        delete this.node.data[this.category][this.key]?.value;
    }

    removeConnections(skipSelf?: boolean) {
        const id = this.id;
        const toRefresh: BlueprintEntry[] = [];

        for (const targetId of this.connections) {
            const targetEntry = this.blueprint.getEntry(targetId);
            if (!targetEntry) continue;

            toRefresh.push(targetEntry);
            targetEntry.node.data[targetEntry.category][targetEntry.key]?.ids?.findSplice(
                (x) => x === id
            );
            this.blueprint.connections.removeConnection(id, targetId);
        }

        if (!skipSelf) {
            delete this.node.data[this.category][this.key]?.ids;
            toRefresh.push(this);
        }

        for (const entry of toRefresh) {
            entry.refreshConnector();
        }
    }

    verticalAlign(el: PIXI.Container, offset: number = 0) {
        el.y = this.rowHeight / 2 - el.height / 2 + offset;
    }

    protected _createLabel(): PIXI.Container | PreciseText | PIXI.Graphics {
        const labelEl = this.node.preciseText(this.label);
        this.verticalAlign(labelEl, -1);
        return labelEl;
    }

    protected _positionChildren() {
        if (this.#connector) {
            if (this.category === "outputs") {
                this.#connector.x = this.#label.width + this.spacing + 2;
            } else {
                this.#label.x = this.#connector.width + this.spacing;
            }
        }
    }

    #createConnector(): PIXI.Graphics | null {
        if (!this.hasConnector) {
            return null;
        }

        const connector = new PIXI.Graphics();
        connector.cursor = "pointer";

        this.#fillConnector(connector);

        connector.eventMode = "static";
        connector.hitArea = new PIXI.Rectangle(0, 0, 12, 12);
        connector.on("pointerdown", this.#onConnectorPointerDown, this);

        return this.addChild(connector);
    }

    #fillConnector(connector = this.#connector) {
        if (!connector) return;

        const isActive = this.isActive;
        const color = this.connectorColor;

        if (isActive) {
            connector.beginFill(color);
        }

        this._fillConnector(connector);

        if (isActive) {
            connector.endFill();
        }
    }

    async #onConnectorPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        if (event.button === 0 && this.canConnect) {
            this.blueprint.connections.startConnection(this);
        } else if (event.button === 2) {
            const { x, y } = event.global;
            const context = this.node.getConnectionContext(this);
            if (!context.length) return;

            const result = await BlueprintSelectMenu.open(this.blueprint, { x, y }, context);
            if (!result) return;

            this.node["_onConnectionContext"](this, result);
        }
    }
}

export { BlueprintEntry };
