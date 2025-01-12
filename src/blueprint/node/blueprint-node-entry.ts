import { Blueprint } from "@blueprint/blueprint";
import { NodeEntryCategory, NodeEntryId, segmentEntryId } from "@data/data-entry";
import { NodeEntryValue } from "@data/data-node";
import { NodeEntryType, NodeSchemaEntry, NodeType } from "@schema/schema";
import { isFieldConnection } from "@schema/schema-list";
import { ItemPF2e, R, localize, localizeIfExist } from "module-helpers";
import { BlueprintNode } from "./blueprint-node";
import { BlueprintNodeBody } from "./blueprint-node-body";

const NODE_TYPE_COLOR: Record<NodeEntryType, PIXI.Color | number> = {
    item: 0x3c85fa,
    boolean: 0x940404,
    uuid: 0x0,
    text: 0x0,
};

const BRIDGE_CONNECTIONS: Record<NodeEntryCategory, NodeConnectionsList> = {
    inputs: {
        // action: ["condition", "action"],
        condition: ["event", "condition"],
        event: [],
        // logic: [],
        value: [],
    },
    outputs: {
        // action: ["action"],
        // condition: ["condition", "action"],
        condition: ["condition"],
        event: ["condition"],
        // logic: [],
        value: [],
    },
};

class BlueprintNodeEntry extends PIXI.Graphics {
    #category: NodeEntryCategory;
    #schema: NodeSchemaEntry;
    #body: BlueprintNodeBody;
    #connector: PIXI.Graphics | null = null;
    #text!: PIXI.Graphics | PreciseText;
    #isField: boolean;

    constructor(body: BlueprintNodeBody, category: NodeEntryCategory, schema: NodeSchemaEntry) {
        super();

        this.#body = body;
        this.#category = category;
        this.#schema = schema;

        this.#isField = category === "inputs" && isFieldConnection(schema.type);
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

    get view() {
        return this.blueprint.view;
    }

    get category(): NodeEntryCategory {
        return this.#category;
    }

    get oppositeCategory(): "inputs" | "outputs" {
        return this.category === "outputs" ? "inputs" : "outputs";
    }

    get key(): string {
        return this.#schema.key;
    }

    get type(): NodeEntryType | undefined {
        return this.#schema.type;
    }

    get id(): NodeEntryId {
        const node = this.node;
        return `${node.id}.${this.category}.${this.key}`;
    }

    get isValue(): boolean {
        return !!this.type;
    }

    get isField(): boolean {
        return this.#isField;
    }

    get connectorColor(): number | PIXI.Color {
        return this.type ? NODE_TYPE_COLOR[this.type] : 0xffffff;
    }

    get label() {
        const path = "node.entry";
        const label = this.#schema.label;
        const key = this.key ?? this.category;

        return label
            ? localizeIfExist(path, label) ?? game.i18n.localize(label)
            : localizeIfExist(path, key) ?? localize(this.node.localizePath, key, "label");
    }

    get connections(): NodeEntryId[] {
        return R.keys(this.node.getConnections(this.category, this.key));
    }

    get value(): NodeEntryValue {
        return this.node.getValue(this.category, this.key);
    }

    set value(value) {
        this.node.setValue(this.category, this.key, value);

        if (this.type === "uuid") {
            this.node.refresh();
        }
    }

    get inputFontSize(): number {
        return this.node.fontSize * 0.86;
    }

    get spacing(): number {
        return 5;
    }

    get isActive(): boolean {
        return !this.#isField && this.connections.length > 0;
    }

    get canConnect(): boolean {
        if (this.#isField) return false;

        const isValue = this.isValue;
        const nbConnections = this.connections.length;

        return (
            nbConnections === 0 ||
            (isValue && this.category === "outputs") ||
            (!isValue && this.category === "inputs")
        );
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

    initialize() {
        this.#connector = this.#createConnector();
        this.#text = this.#createText();

        this.#positionChildren();
    }

    canConnectoToBridge(target: NodeType) {
        const allowed = BRIDGE_CONNECTIONS[this.category][this.node.type];
        return allowed.includes(target);
    }

    canConnectTo(other: BlueprintNodeEntry) {
        if (
            this.isField ||
            this.category === other.category ||
            this.node.id === other.node.id ||
            this.type !== other.type
        )
            return false;

        if (!this.isValue) {
            const output = this.category === "outputs" ? this : other;
            const input = output === this ? other : this;

            if (!output.canConnectoToBridge(input.node.type)) {
                return false;
            }
        }

        const connections = this.connections;

        if (connections.length === 0) return true;
        if (other.id in connections) return false;

        const isValue = this.isValue;

        return (isValue && this.category === "outputs") || (!isValue && this.category === "inputs");
    }

    onConnect({ x, y }: Point, other: BlueprintNodeEntry): this | undefined {
        const canConnect = this.canConnectTo(other);
        return canConnect && this.#connector?.getBounds().contains(x, y) ? this : undefined;
    }

    onDropItem({ x, y }: Point, item: ItemPF2e | CompendiumIndexData): boolean {
        if (this.isField && this.#text.getBounds().contains(x, y)) {
            this.#onItemDropped(item);
            return true;
        }
        return false;
    }

    refreshConnector() {
        this.#connector?.clear();
        this.#fillConnector();
    }

    addConnection(id: NodeEntryId) {
        this.node.addConnection(this.category, this.key, id);
        this.refreshConnector();
    }

    *removeConnections(): Generator<[NodeEntryId, NodeEntryId], void, undefined> {
        const originId = this.id;

        for (const targetId of this.connections) {
            const { nodeId, category, key } = segmentEntryId(targetId);
            const targetNode = this.blueprint.layers.nodes.getNode(nodeId);
            if (!targetNode) continue;

            targetNode.deleteConnection(category, key, this.id);
            targetNode.getEntryFromId(targetId)?.refreshConnector();

            yield [originId, targetId];
        }
    }

    #onItemDropped(item: ItemPF2e | CompendiumIndexData) {
        switch (this.type) {
            case "uuid": {
                this.value = item.uuid;
                break;
            }
        }
    }

    #createConnector(): PIXI.Graphics | null {
        if (this.#isField) return null;

        const connector = new PIXI.Graphics();
        connector.cursor = "pointer";

        this.#fillConnector(connector);

        connector.eventMode = "static";
        connector.hitArea = new PIXI.Rectangle(0, 0, 12, 12);
        connector.on("pointerdown", this.#onIconPointerDown, this);

        return this.addChild(connector);
    }

    #createText(): PIXI.Graphics | PreciseText {
        if (!this.isField) {
            const textEl = this.node.preciseText(this.label);
            return this.addChild(textEl);
        }

        const value = this.value;
        const label = value ? String(value) : this.label;
        const textEl = this.node.preciseText(label, {
            fill: value ? "#ffffff" : "#ffffff80",
            fontSize: this.inputFontSize,
        });

        const width = 120;
        const padding = 4;
        const height = textEl.height + 3;

        const field = new PIXI.Graphics();
        field.cursor = "text";
        field.lineStyle({ color: 0xffffff, width: 1 });
        field.drawRect(0, 1, width, height);

        field.name = `${this.category}.${this.key ?? this.category}`;
        field.eventMode = "static";
        field.hitArea = new PIXI.Rectangle(0, 0, width, height);
        field.on("pointerdown", (event) => event.stopPropagation());
        field.on("pointerup", this.#onInputFocus, this);

        textEl.x = padding;
        textEl.y = 2;

        const textMask = new PIXI.Graphics();
        textMask.beginFill(0x555555);
        textMask.drawRect(0, 0, width - padding * 2, textEl.height);
        textMask.endFill();

        textEl.addChild(textMask);
        textEl.mask = textMask;

        field.addChild(textEl);

        return this.addChild(field);
    }

    #onIconPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        if (event.button === 0 && this.canConnect) {
            this.blueprint.layers.connections.startConnection(this);
        } else if (event.button === 2 && this.isActive) {
        }
    }

    #onInputFocus(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        const value = this.value;
        const bounds = this.#text.getBounds();
        const viewBounds = this.view.getBoundingClientRect();

        this.#text.children[0].visible = false;

        const el = document.createElement("input");
        el.type = "text";
        el.value = R.isString(value) ? value : "";

        Object.assign(el.style, {
            position: "absolute",
            width: `${bounds.width}px`,
            height: `${bounds.height}px`,
            left: `${bounds.x + viewBounds.x + 1}px`,
            top: `${bounds.y + viewBounds.y}px`,
            fontSize: `${this.inputFontSize}px`,
            borderColor: "transparent",
            zIndex: "2147483647",
            color: "white",
        } satisfies Partial<CSSStyleDeclaration>);

        document.body.appendChild(el);

        el.focus();
        el.setSelectionRange(0, -1);

        const onBlur = () => {
            this.value = el.value;
            el.remove();
        };

        el.addEventListener("blur", onBlur);

        el.addEventListener("keydown", (event) => {
            if (!["Enter", "Escape"].includes(event.key)) return;

            event.preventDefault();
            event.stopPropagation();

            switch (event.key) {
                case "Enter": {
                    el.blur();
                    break;
                }

                case "Escape": {
                    el.removeEventListener("blur", onBlur);
                    el.remove();
                    this.#text.children[0].visible = true;
                    break;
                }
            }
        });
    }

    #fillConnector(connector = this.#connector) {
        if (!connector) return;

        const isActive = this.isActive;
        const color = this.connectorColor;

        if (isActive) {
            connector.beginFill(color);
        }

        if (this.isValue) {
            connector.lineStyle({ color, width: 2 });
            connector.drawCircle(5, 6, 6);
        } else {
            connector.lineStyle({ color, width: 1 });
            connector.moveTo(0, 0);
            connector.lineTo(6, 0);
            connector.lineTo(12, 6);
            connector.lineTo(6, 12);
            connector.lineTo(0, 12);
            connector.lineTo(0, 0);
        }

        if (isActive) {
            connector.endFill();
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
}

type NodeConnectionsList = Record<NodeType, NodeType[]>;

export { BlueprintNodeEntry };
