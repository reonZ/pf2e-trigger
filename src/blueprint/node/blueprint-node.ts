import { Blueprint } from "blueprint/blueprint";
import { BlueprintNodesLayer } from "blueprint/layer/layer-nodes";
import { BlueprintSelectMenu } from "blueprint/menu/blueprint-select-menu";
import { NodeEntryId } from "data/data-entry";
import { NodeData, NodeEntryValue } from "data/data-node";
import { R, localize, subtractPoints } from "module-helpers";
import { NodeEntryCategory, NodeEntryType, NodeSchema, NodeType } from "schema/schema";
import { getSchema } from "schema/schema-list";
import { BlueprintNodeBody } from "./blueprint-node-body";
import { BlueprintNodeBorder } from "./blueprint-node-border";
import { BlueprintNodeHeader } from "./blueprint-node-header";
import { BlueprintEntry } from "./entry/blueprint-entry";
import { TriggerData } from "data/data-trigger";

const NODE_CONTEXT = ["duplicate", "delete"] as const;

abstract class BlueprintNode extends PIXI.Container {
    #data: NodeData;
    #dragOffset: Point = { x: 0, y: 0 };
    #schema: NodeSchema;
    #header: BlueprintNodeHeader | null = null;
    #body!: BlueprintNodeBody;
    #border!: BlueprintNodeBorder;
    #blueprint: Blueprint;

    constructor(blueprint: Blueprint, data: NodeData) {
        super();

        this.#data = data;
        this.#schema = getSchema(data);
        this.#blueprint = blueprint;

        this.x = data.x;
        this.y = data.y;

        this.eventMode = "static";

        this.on("pointerdown", this.#onPointerDown, this);

        if (this.canDrag) {
            this.cursor = "move";
        }
    }

    get body(): BlueprintNodeBody {
        return this.#body;
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
        return this.#blueprint;
    }

    get trigger(): TriggerData | null {
        return this.blueprint.trigger;
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

    get innerWidth(): number {
        return Math.max(this.#header?.innerWidth ?? 0, this.#body.innerWidth);
    }

    get hasVariables(): boolean {
        return !!this.schema.variables?.length;
    }

    get counter(): number {
        if (!this.schema.variables?.length || !!this.schema.unique) {
            return 0;
        }

        let counter = 0;

        for (const node of R.values(this.trigger?.nodes ?? {})) {
            if (node.key !== this.key) continue;

            counter++;

            if (node.id === this.id) {
                return counter > 1 ? counter : 0;
            }
        }

        return 0;
    }

    protected get context(): ReadonlyArray<(typeof NODE_CONTEXT)[number]> {
        return NODE_CONTEXT;
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
    ): Generator<BlueprintEntry, void, undefined> {
        for (const entry of this.#body.entries(category)) {
            if (activeOnly && !entry.isActive) continue;
            yield entry;
        }
    }

    onConnect(point: Point, other: BlueprintEntry): BlueprintEntry | null | undefined {
        if (!this.getBounds().contains(point.x, point.y)) return;

        for (const entry of this.entries(other.oppositeCategory)) {
            const connected = entry.onConnect(point, other);

            if (connected) {
                return connected;
            }
        }

        return null;
    }

    onDropDocument(point: Point, document: ClientDocument | CompendiumIndexData): boolean {
        if (!this.getBounds().contains(point.x, point.y)) return false;

        for (const entry of this.entries()) {
            if (entry.onDropDocument(point, document)) break;
        }

        return true;
    }

    getEntryFromType(category: NodeEntryCategory, type: NodeEntryType): BlueprintEntry | undefined {
        return this.#body.getEntryFromType(category, type);
    }

    getEntryFromId(id: NodeEntryId): BlueprintEntry | undefined {
        return this.#body.getEntryFromId(id);
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

    getConnections(category: NodeEntryCategory, key: string): NodeEntryId[] {
        return this.#data[category][key]?.ids ?? [];
    }

    addConnection(category: NodeEntryCategory, key: string, id: NodeEntryId) {
        const ids = this.getConnections(category, key);
        ids.push(id);
        fu.setProperty(this.#data, `${category}.${key}.ids`, ids);
    }

    deleteConnection(category: NodeEntryCategory, key: string, id: NodeEntryId) {
        this.#data[category][key]?.ids?.findSplice((x) => x === id);
    }

    deleteConnections(category: NodeEntryCategory, key: string) {
        delete this.#data[category][key]?.ids;
    }

    protected async _onContextMenu(event: PIXI.FederatedPointerEvent): Promise<void> {
        const { x, y } = event.global;
        const context = await BlueprintSelectMenu.open(this.blueprint, { x, y }, this.context);
        if (!context) return;

        switch (context) {
            case "delete": {
                return this.blueprint.deleteNode(this.id);
            }

            case "duplicate": {
                return this.blueprint.cloneNode(this.id);
            }
        }
    }

    #paint() {
        const maxInner = this.innerWidth;
        const maxWidth = maxInner + this.outerPadding * 2;

        this.#body.y = this.#header?.outerHeight ?? 0;

        this.#header?.paint(maxWidth);
        this.#body.paint(maxWidth);
        this.#border.paint(maxWidth);
    }

    async #onPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        if (event.button === 0 && this.canDrag) {
            this.bringToTop();
            this.#onDragStart(event);
        } else if (event.button === 2) {
            this._onContextMenu(event);
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
