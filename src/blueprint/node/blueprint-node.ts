import { Blueprint } from "@blueprint/blueprint";
import { BlueprintNodesLayer } from "@blueprint/layer/layer-nodes";
import { NodeSchema, NodeType } from "@schema/schema";
import { getSchema } from "@schema/schema-list";
import { NodeEntryCategory, NodeEntryId, NodeEntryIdMap, NodeEntryType } from "@data/data-entry";
import { NodeData, NodeEntryValue } from "@data/data-node";
import { ItemPF2e, R, localize, subtractPoints } from "module-helpers";
import { BlueprintNodeHeader } from "./blueprint-node-header";
import { BlueprintNodeBody } from "./blueprint-node-body";
import { BlueprintNodeBorder } from "./blueprint-node-border";
import {
    NodeContextMenu,
    NodeContextMenuValue,
} from "@blueprint/menu/context-menu/node-context-menu";
import { BlueprintNodeEntry } from "./blueprint-node-entry";

class BlueprintNode extends PIXI.Container {
    #data: NodeData;
    #dragOffset: Point = { x: 0, y: 0 };
    #schema: NodeSchema;
    #header: BlueprintNodeHeader | null = null;
    #body!: BlueprintNodeBody;
    #border!: BlueprintNodeBorder;

    constructor(data: NodeData) {
        super();

        this.#data = data;
        this.#schema = getSchema(data);

        this.x = data.x;
        this.y = data.y;

        this.eventMode = "static";

        if (this.canDrag) {
            this.cursor = "move";
            this.on("pointerdown", this.#onPointerDown, this);
        } else {
            this.on("pointerdown", (event) => event.stopPropagation());
        }
    }

    get schema(): NodeSchema {
        return this.#schema;
    }

    get id(): string {
        return this.#data.id;
    }

    get type(): NodeType {
        return this.#data.type;
    }

    get key(): string {
        return this.#data.key;
    }

    get canDrag(): boolean {
        return this.type !== "event";
    }

    get stage(): PIXI.Container {
        return this.parent.stage;
    }

    get blueprint(): Blueprint {
        return this.parent.blueprint;
    }

    get outerPadding(): number {
        return 10;
    }

    get backgroundColor(): PIXI.Color | number {
        return 0x000000;
    }

    get fontSize(): number {
        return 14;
    }

    get opacity(): number {
        return 0.6;
    }

    get entryData() {
        return {
            padding: { x: this.outerPadding, y: 6 },
            height: this.fontSize * 1.16,
            spacing: 8,
        };
    }

    get icon(): PIXI.Sprite | string | null {
        return null;
    }

    get localizePath(): string {
        return `node.${this.type}.${this.key}`;
    }

    get title(): string | null {
        return localize(this.localizePath, "title");
    }

    get subtitle(): string | null {
        return localize("node", this.type, "subtitle");
    }

    get headerColor(): PIXI.Color | number {
        return 0x0;
    }

    initialize() {
        this.#header = this.title ? new BlueprintNodeHeader(this) : null;
        this.#body = new BlueprintNodeBody(this);
        this.#border = new BlueprintNodeBorder(this);

        this.#header?.initialize();
        this.#body.initialize();
        this.#border?.initialize();

        this.#paint();
    }

    refresh() {
        const removed = this.removeChildren();

        for (let i = 0; i < removed.length; ++i) {
            removed[i].destroy();
        }

        this.initialize();
    }

    *entries(
        category?: NodeEntryCategory,
        activeOnly?: boolean
    ): Generator<BlueprintNodeEntry, void, undefined> {
        for (const entry of this.#body.entries(category)) {
            if (activeOnly && !entry.isActive) continue;
            yield entry;
        }
    }

    onConnect(point: Point, other: BlueprintNodeEntry): BlueprintNodeEntry | null | undefined {
        if (!this.getBounds().contains(point.x, point.y)) return;

        for (const entry of this.entries(other.oppositeCategory)) {
            const connected = entry.onConnect(point, other);

            if (connected) {
                return connected;
            }
        }

        return null;
    }

    getEntryFromType(
        category: NodeEntryCategory,
        type: NodeEntryType | undefined
    ): BlueprintNodeEntry | undefined {
        return this.#body.getEntryFromType(category, type);
    }

    getEntryFromId(id: NodeEntryId): BlueprintNodeEntry | undefined {
        return this.#body.getEntryFromId(id);
    }

    onDropItem(point: Point, item: ItemPF2e | CompendiumIndexData): boolean {
        for (const entry of this.entries()) {
            const dropped = entry.onDropItem(point, item);
            if (dropped) return true;
        }
        return false;
    }

    bringToTop() {
        const highest = R.firstBy(this.parent.children, [R.prop("zIndex"), "desc"])?.zIndex ?? 0;
        this.zIndex = highest + 1;
        this.parent.sortChildren();
    }

    setPosition(x: number, y: number): void;
    setPosition(point: Point): void;
    setPosition(xOrPoint: Point | number, y: number = 0) {
        const position = R.isNumber(xOrPoint) ? { x: xOrPoint, y } : xOrPoint;

        this.position.set(position.x, position.y);
        this.#data.x = position.x;
        this.#data.y = position.y;

        this.blueprint.layers.connections.updateConnections(this);
    }

    fontAwesomeIcon(unicode: string, options: Omit<Partial<PIXI.ITextStyle>, "fontFamily"> = {}) {
        return this.preciseText(
            unicode,
            fu.mergeObject({ fontFamily: "Font Awesome 6 Pro" }, options)
        );
    }

    preciseText(text: string, options: Partial<PIXI.ITextStyle> = {}) {
        const style = new PIXI.TextStyle(
            fu.mergeObject(
                {
                    fontFamily: "Signika",
                    fontSize: this.fontSize,
                    fontStyle: "normal",
                    fontWeight: "normal",
                    fill: "#ffffff",
                    stroke: "#111111",
                    strokeThickness: 0,
                    dropShadow: true,
                    dropShadowColor: "#000000",
                    dropShadowBlur: 2,
                    dropShadowAngle: 0,
                    dropShadowDistance: 0,
                    wordWrap: false,
                    wordWrapWidth: 100,
                    lineJoin: "miter",
                },
                options
            )
        );

        return new PreciseText(text, style);
    }

    getValue(category: NodeEntryCategory, key: string): NodeEntryValue {
        return this.#data[category][key]?.value;
    }

    setValue(category: NodeEntryCategory, key: string, value: NodeEntryValue) {
        fu.setProperty(this.#data, `${category}.${key}.value`, value);
    }

    getConnections(category: NodeEntryCategory, key: string): NodeEntryIdMap {
        return this.#data[category][key]?.ids ?? {};
    }

    addConnection(category: NodeEntryCategory, key: string, id: NodeEntryId) {
        const ids = this.getConnections(category, key);
        ids[id] = true;
        fu.setProperty(this.#data, `${category}.${key}.ids`, ids);
    }

    deleteConnection(category: NodeEntryCategory, key: string, id: NodeEntryId): boolean {
        return delete this.#data[category][key]?.ids?.[id];
    }

    #paint() {
        const maxInner = Math.max(this.#header?.innerWidth ?? 0, this.#body.innerWidth);
        const maxWidth = maxInner + this.outerPadding * 2;

        this.#body.y = this.#header?.outerHeight ?? 0;

        this.#header?.paint(maxWidth);
        this.#body.paint(maxWidth);
        this.#border.paint(maxWidth);
    }

    async #onPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        if (event.button === 0) {
            this.bringToTop();
            this.#onDragStart(event);
        } else if (event.button === 2) {
            const { x, y } = event.global;
            const result = await NodeContextMenu.open<NodeContextMenuValue>(
                this.blueprint,
                { x, y },
                this
            );
            if (!result) return;

            switch (result) {
                case "delete": {
                    return this.blueprint.deleteNode(this.id);
                }
            }
        }
    }

    #onDragStart(event: PIXI.FederatedPointerEvent) {
        this.#dragOffset = event.getLocalPosition(this);

        this.stage.on("pointerup", this.#onDragEnd, this);
        this.stage.on("pointerupoutside", this.#onDragEnd, this);
        this.stage.on("pointermove", this.#onDragMove, this);
    }

    #onDragMove(event: PIXI.FederatedPointerEvent) {
        const position = subtractPoints(event.global, this.#dragOffset);
        const newPosition = this.stage.toLocal(position);

        this.setPosition(newPosition);
    }

    #onDragEnd(event: PIXI.FederatedPointerEvent) {
        this.stage.off("pointerup", this.#onDragEnd, this);
        this.stage.off("pointerupoutside", this.#onDragEnd, this);
        this.stage.off("pointermove", this.#onDragMove, this);
    }
}

interface BlueprintNode extends PIXI.Container {
    parent: BlueprintNodesLayer;
}

export { BlueprintNode };
