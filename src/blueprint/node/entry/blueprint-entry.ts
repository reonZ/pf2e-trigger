import { Blueprint } from "blueprint/blueprint";
import { BlueprintSelectMenu } from "blueprint/menu/blueprint-select-menu";
import { NodeEntryId, segmentEntryId } from "data/data-entry";
import { localize, localizeIfExist } from "module-helpers";
import { NodeEntryCategory, NodeEntryType, NodeSchema, NodeType } from "schema/schema";
import { BlueprintNode } from "../blueprint-node";
import { BlueprintNodeBody } from "../blueprint-node-body";

const CONNECTION_CONTEXT = ["disconnect"] as const;

abstract class BlueprintEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends PIXI.Graphics {
    #schema: NonNullable<NodeSchema[TCategory]>[number];
    #body: BlueprintNodeBody;
    #category: TCategory;
    #connector: PIXI.Graphics | null = null;
    #text!: PIXI.Container | PIXI.Graphics | PreciseText;

    constructor(
        category: TCategory,
        body: BlueprintNodeBody,
        schema: NonNullable<NodeSchema[TCategory]>[number]
    ) {
        super();

        this.#body = body;
        this.#schema = schema;
        this.#category = category;
    }

    abstract get canConnect(): boolean;
    abstract get isActive(): boolean;
    abstract get isValue(): boolean;
    abstract onDropDocument(point: Point, item: ClientDocument | CompendiumIndexData): boolean;
    abstract canConnectoToBridge(target: NodeType): boolean;
    protected abstract _fillConnector(connector: PIXI.Graphics): void;

    get schema(): NonNullable<NodeSchema[TCategory]>[number] {
        return this.#schema;
    }

    get body(): BlueprintNodeBody {
        return this.#body;
    }

    get node(): BlueprintNode {
        return this.body.node;
    }

    get blueprint(): Blueprint {
        return this.node.blueprint;
    }

    get category(): TCategory {
        return this.#category;
    }

    get oppositeCategory(): "inputs" | "outputs" {
        return this.category === "outputs" ? "inputs" : "outputs";
    }

    get id(): NodeEntryId {
        const node = this.node;
        return `${node.id}.${this.category}.${this.key}`;
    }

    get type(): NodeEntryType {
        return this.#schema.type;
    }

    get key(): string {
        return this.#schema.key;
    }

    get connections(): NodeEntryId[] {
        return this.node.getConnections(this.category, this.key);
    }

    get spacing(): number {
        return 5;
    }

    get label() {
        const path = "node.entry";
        const label = this.#schema.label;
        const key = this.key ?? this.category;

        return label
            ? localizeIfExist(path, label) ?? game.i18n.localize(label)
            : localizeIfExist(path, key) ?? localize(this.node.localizePath, key, "label");
    }

    get textComponent(): PIXI.Container | PIXI.Graphics | PreciseText {
        return this.#text;
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

    get connectorColor(): PIXI.Color | number {
        return 0xffffff;
    }

    initialize() {
        const connector = this._createConnector();
        this.#connector = connector ? this.addChild(connector) : null;
        this.#text = this.addChild(this._createText());
        this.#positionChildren();
    }

    refreshConnector() {
        this.#connector?.clear();
        this.#fillConnector();
    }

    canConnectTo(other: BlueprintEntry): boolean {
        return (
            this.category !== other.category &&
            this.node.id !== other.node.id &&
            this.type === other.type &&
            this.canConnect &&
            !(other.id in this.connections)
        );
    }

    onConnect({ x, y }: Point, other: BlueprintEntry): this | undefined {
        const canConnect = this.canConnectTo(other);
        return canConnect && this.#connector?.getBounds().contains(x, y) ? this : undefined;
    }

    addConnection(id: NodeEntryId) {
        this.node.addConnection(this.category, this.key, id);
        this.refreshConnector();
    }

    removeConnections() {
        const originId = this.id;

        for (const targetId of this.connections) {
            const { nodeId, category, key } = segmentEntryId(targetId);
            const targetNode = this.blueprint.layers.nodes.getNode(nodeId);
            if (!targetNode) continue;

            targetNode.deleteConnection(category, key, this.id);
            targetNode.getEntryFromId(targetId)?.refreshConnector();

            this.blueprint.layers.connections.removeConnection(originId, targetId);
        }

        this.node.deleteConnections(this.category, this.key);
        this.refreshConnector();
    }

    protected _createText(): PIXI.Container | PreciseText | PIXI.Graphics {
        const textEl = this.node.preciseText(this.label);
        return this.addChild(textEl);
    }

    protected _createConnector(): PIXI.Graphics | null {
        const connector = new PIXI.Graphics();
        connector.cursor = "pointer";

        this.#fillConnector(connector);

        connector.eventMode = "static";
        connector.hitArea = new PIXI.Rectangle(0, 0, 12, 12);
        connector.on("pointerdown", this.#onConnectorPointerDown, this);

        return connector;
    }

    async #onConnectorPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        if (event.button === 0 && this.canConnect) {
            this.blueprint.layers.connections.startConnection(this);
        } else if (event.button === 2 && this.isActive) {
            const { x, y } = event.global;
            const result = await BlueprintSelectMenu.open(
                this.blueprint,
                { x, y },
                CONNECTION_CONTEXT
            );
            if (!result) return;

            switch (result) {
                case "disconnect": {
                    this.removeConnections();
                }
            }
        }
    }

    #positionChildren() {
        if (this.#connector) {
            const rowHeight = this.body.rowHeight;

            this.#connector.y = rowHeight / 2 - this.#connector.height / 2 + 1;
            this.#text.y = rowHeight / 2 - this.#text.height / 2;

            if (this.category === "outputs") {
                this.#connector.x = this.#text.width + this.spacing + 2;
            } else {
                this.#text.x = this.#connector.width + this.spacing;
            }
        }
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
}

export { BlueprintEntry };
