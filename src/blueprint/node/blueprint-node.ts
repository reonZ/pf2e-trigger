import { Blueprint } from "blueprint/blueprint";
import { BlueprintEntry } from "blueprint/entry/blueprint-entry";
import { BlueprintInputEntry } from "blueprint/entry/blueprint-entry-input/blueprint-entry-input";
import { BlueprintSelectMenu } from "blueprint/menu/bluprint-menu-select";
import { MODULE, R, localize, subtractPoints } from "module-helpers";
import { getSchema } from "schema/schema-list";
import { BlueprintNodeBody } from "./blueprint-node-body";
import { BlueprintNodeHeader } from "./blueprint-node-header";

abstract class BlueprintNode extends PIXI.Container {
    #data: NodeData;
    #dragOffset: Point = { x: 0, y: 0 };
    #schema: NodeSchema;
    #header: BlueprintNodeHeader | null;
    #body: BlueprintNodeBody;
    #border: PIXI.Graphics;
    #mask: PIXI.Graphics;
    #blueprint: Blueprint;

    constructor(blueprint: Blueprint, data: NodeData) {
        super();

        this.#data = data;
        this.#schema = getSchema(data);
        this.#blueprint = blueprint;

        this.#header = this.title ? new BlueprintNodeHeader(this) : null;
        this.#body = new BlueprintNodeBody(this);
        this.#border = this.addChild(new PIXI.Graphics());
        this.#mask = this.addChild(new PIXI.Graphics());

        this.mask = this.#mask;

        this.x = data.x;
        this.y = data.y;

        this.eventMode = "static";

        this.on("pointerdown", this.#onPointerDown, this);

        if (this.canDrag) {
            this.cursor = "move";
        }

        this.#paint();
    }

    get canDrag(): boolean {
        return true;
    }

    get data(): NodeData {
        return this.#data;
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

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get trigger(): TriggerData {
        return this.blueprint.trigger!;
    }

    get stage(): PIXI.Container {
        return this.blueprint.stage;
    }

    get context(): string[] {
        return this.schema.unique ? ["delete-node"] : ["duplicate", "delete-node"];
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

    get outerPadding(): number {
        return 10;
    }

    get rowHeight(): number {
        return this.fontSize * 1.16;
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

    get innerWidth(): number {
        return Math.max(this.#header?.innerWidth ?? 0, this.#body.innerWidth);
    }

    get outerWidth(): number {
        return this.innerWidth + this.outerPadding * 2;
    }

    get entriesSpacing(): number {
        return 20;
    }

    get isEvent(): boolean {
        return this.type === "event";
    }

    initialize() {}

    refresh(schema?: boolean) {
        if (this.#header) {
            this.removeChild(this.#header);
            this.#header.destroy();
        }

        this.removeChild(this.#body);
        this.#body.destroy();

        if (schema) {
            this.#schema = getSchema(this.#data);
            MODULE.debug("refresh", this);
        }

        this.#header = this.title ? new BlueprintNodeHeader(this) : null;
        this.#body = new BlueprintNodeBody(this);

        this.#paint();
        this.blueprint.connections.updateNodeConnections(this);
    }

    refreshHeader() {
        if (!this.#header) return;

        this.removeChild(this.#header);
        this.#header.destroy();

        this.#header = new BlueprintNodeHeader(this);
        this.#header.paint(this.outerWidth);
    }

    entries(category: "inputs"): Generator<BlueprintInputEntry, void, undefined>;
    entries(category: "outputs"): Generator<BlueprintEntry<"outputs">, void, undefined>;
    entries(category?: NodeEntryCategory): Generator<BlueprintEntry, void, undefined>;
    entries(category?: NodeEntryCategory) {
        return this.#body.entries(category);
    }

    getEntry(id: NodeEntryId) {
        return this.#body.getEntry(id);
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

        this.blueprint.connections.updateNodeConnections(this);
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

        for (const entry of this.entries("inputs")) {
            if (entry.onDropDocument(point, document)) break;
        }

        return true;
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

    getConnectionContext(entry: BlueprintEntry): string[] {
        const context: string[] = [];

        if (
            this.type !== "variable" &&
            entry.category === "outputs" &&
            !entry.isBridgeEntry() &&
            (!this.schema.unique ||
                !this.schema.variables.some((variable) => variable.key === entry.key))
        ) {
            const entryId = entry.id;

            if (entryId in this.trigger.variables) {
                context.push("remove-variable");
            } else {
                context.push("add-variable");
            }
        }

        if (entry.isActive) {
            context.push("disconnect");
        }

        return context;
    }

    _onValueUpdate(key: string): boolean {
        return true;
    }

    protected async _onContext(context: string) {
        switch (context) {
            case "delete-node": {
                return this.blueprint.deleteNode(this.id);
            }

            case "duplicate": {
                return this.blueprint.cloneNode(this.id);
            }
        }
    }

    protected async _onConnectionContext(entry: BlueprintEntry, context: string) {
        switch (context) {
            case "disconnect": {
                return entry.removeConnections();
            }

            case "add-variable": {
                return this.blueprint.addVariable(entry);
            }

            case "remove-variable": {
                return this.blueprint.removeVariable(entry);
            }
        }
    }

    async #onContextMenu(event: PIXI.FederatedPointerEvent): Promise<void> {
        const { x, y } = event.global;
        const context = await BlueprintSelectMenu.open(this.blueprint, { x, y }, this.context);
        if (!context) return;

        this._onContext(context);
    }

    #paint() {
        const maxWidth = this.outerWidth;

        this.#body.y = this.#header?.outerHeight ?? 0;

        this.#header?.paint(maxWidth);
        this.#body.paint(maxWidth);

        const height = (this.#header?.outerHeight ?? 0) + this.#body.height;
        const borderWidth = 2;
        const borderRadius = 10;

        this.#mask.clear();
        this.#mask.beginFill(0x555555);
        this.#mask.drawRoundedRect(0, 0, maxWidth, height, borderRadius);
        this.#mask.endFill();

        this.#border.clear();
        this.#border.lineStyle({ color: 0x0, width: borderWidth, alpha: 0.8 });
        this.#border.drawRoundedRect(0, 0, maxWidth, height, borderRadius);

        this.#border.zIndex = 1;
        this.#mask.zIndex = 2;
        this.sortChildren();
    }

    async #onPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        if (event.button === 0 && this.canDrag) {
            this.bringToTop();
            this.#onDragStart(event);
        } else if (event.button === 2) {
            this.#onContextMenu(event);
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

export { BlueprintNode };
