import { Blueprint } from "@blueprint/blueprint";
import {
    NodeEntryCategory,
    NodeEntryId,
    NodeEntryIdMap,
    NodeEntryType,
    NodeEntryValue,
    NodeSchemaEntry,
    NodeType,
    TriggerNode,
} from "@node/trigger-node";
import { ItemPF2e, R, joinStr, localize, localizeIfExist } from "module-helpers";
import { BlueprintNode } from "./blueprint-node";
import { BlueprintNodeBody } from "./node-body";

const NODE_TYPE_COLOR: Record<NodeEntryType, PIXI.Color | number> = {
    item: 0x3c85fa,
    boolean: 0x940404,
    uuid: 0x0,
    text: 0x0,
};

const FIELD_TYPES: NodeEntryType[] = ["uuid", "text"];

const BRIDGE_CONNECTIONS: Record<NodeEntryCategory, NodeConnectionsList> = {
    inputs: {
        action: ["condition", "action"],
        condition: ["event", "condition"],
        event: [],
        logic: [],
        value: [],
    },
    outputs: {
        action: ["action"],
        condition: ["condition", "action"],
        event: ["condition"],
        logic: [],
        value: [],
    },
};

class BlueprintNodeEntry extends PIXI.Graphics {
    #category: NodeEntryCategory;
    #schema: NodeSchemaEntry;
    #body: BlueprintNodeBody;
    #isField: boolean;
    #connector: PIXI.Graphics | null;
    #text: PIXI.Graphics | PreciseText;

    constructor(body: BlueprintNodeBody, category: NodeEntryCategory, schema: NodeSchemaEntry) {
        super();

        this.#category = category;
        this.#schema = schema;
        this.#body = body;

        this.#isField = category === "inputs" && isFieldConnection(schema.type);

        this.#connector = this.#createConnector();
        this.#text = this.#createText();

        this.#positionChildren();
    }

    get id(): NodeEntryId {
        const node = this.node;
        return joinStr(".", node.type, node.id, this.category, this.key) as NodeEntryId;
    }

    get node(): BlueprintNode {
        return this.body.node;
    }

    get trigger(): TriggerNode {
        return this.node.trigger;
    }

    get blueprint(): Blueprint {
        return this.body.blueprint;
    }

    get view(): HTMLCanvasElement {
        return this.blueprint.view;
    }

    get type(): NodeEntryType | undefined {
        return this.#schema.type;
    }

    get key(): string {
        return this.#schema.key;
    }

    get category(): NodeEntryCategory {
        return this.#category;
    }

    get oppositeCategory(): "inputs" | "outputs" {
        return this.category === "outputs" ? "inputs" : "outputs";
    }

    get body(): BlueprintNodeBody {
        return this.#body;
    }

    get isField(): boolean {
        return this.#isField;
    }

    get isValue(): boolean {
        return !!this.type;
    }

    get value(): NodeEntryValue {
        return this.trigger.getValue(this.category, this.key);
    }

    set value(value) {
        this.trigger.updateValue(this.category, this.key, value);
        this.node.refresh();
    }

    get connections(): NodeEntryIdMap {
        return this.trigger.getConnections(this.category, this.key);
    }

    get spacing(): number {
        return 5;
    }

    get isActive(): boolean {
        return !this.#isField && Object.keys(this.connections).length > 0;
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

    get inputFontSize(): number {
        return this.node.fontSize * 0.86;
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

    get canConnect(): boolean {
        if (this.#isField) return false;

        const isValue = this.isValue;
        const nbConnections = Object.keys(this.connections).length;

        return (
            nbConnections === 0 ||
            (isValue && this.category === "outputs") ||
            (!isValue && this.category === "inputs")
        );
    }

    refreshConnector() {
        this.#fillConnector();
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

            if (!canConnectoToBridge("outputs", output.node.type, input.node.type)) {
                return false;
            }
        }

        const connections = Object.keys(this.connections);

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

    #onItemDropped(item: ItemPF2e | CompendiumIndexData) {
        switch (this.type) {
            case "uuid": {
                this.value = item.uuid;
                break;
            }
        }
    }

    #onIconPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        if (event.button === 0 && this.canConnect) {
            this.blueprint.layers.connections.startConnection(this);
        } else if (event.button === 2 && this.isActive) {
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

        connector.clear();

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

        const self = this;
        const stage = this.node.stage;
        stage.eventMode = "none";
        stage.interactiveChildren = false;

        const onBlur = function () {
            self.value = el.value;

            stage.eventMode = "static";
            stage.interactiveChildren = true;

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
}

function isFieldConnection(type: NodeEntryType | undefined): boolean {
    return !!type && FIELD_TYPES.includes(type);
}

function canConnectoToBridge(category: NodeEntryCategory, origin: NodeType, target: NodeType) {
    const allowed = BRIDGE_CONNECTIONS[category][origin];
    return allowed.includes(target);
}

type NodeConnectionsList = Record<NodeType, NodeType[]>;

export { BlueprintNodeEntry, canConnectoToBridge, isFieldConnection };
export type { NodeConnectionsList };
