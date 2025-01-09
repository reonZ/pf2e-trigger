import { Blueprint } from "@blueprint/blueprint";
import { BlueprintNodesLayer } from "@blueprint/layer/layer-nodes";
import {
    NodeEntryCategory,
    NodeEntryId,
    NodeEntryType,
    NodeSchema,
    NodeType,
    TriggerNode,
} from "@node/trigger-node";
import { ItemPF2e, R, localize, subtractPoints } from "module-helpers";
import { BlueprintNodeBody } from "./node-body";
import { BlueprintNodeBorder } from "./node-border";
import { BlueprintNodeEntry } from "./node-entry";
import { BlueprintNodeHeader } from "./node-header";

abstract class BlueprintNode extends PIXI.Container {
    #dragOffset: Point = { x: 0, y: 0 };
    #trigger: TriggerNode;
    #header: BlueprintNodeHeader | null;
    #body: BlueprintNodeBody;
    #border: BlueprintNodeBorder;

    constructor(trigger: TriggerNode) {
        super();

        this.#trigger = trigger;

        this.x = trigger.x;
        this.y = trigger.y;

        if (this.canDrag) {
            this.cursor = "move";
            this.eventMode = "static";
            this.on("pointerdown", this.#onPointerDown, this);
        }

        this.#header = this.title ? new BlueprintNodeHeader(this) : null;
        this.#body = new BlueprintNodeBody(this);
        this.#border = new BlueprintNodeBorder(this);

        this.#paint();
    }

    get id(): string {
        return this.#trigger.id;
    }

    get type(): NodeType {
        return this.#trigger.type;
    }

    get key(): string {
        return this.#trigger.key;
    }

    get trigger(): TriggerNode {
        return this.#trigger;
    }

    get schema(): NodeSchema {
        return this.#trigger.schema;
    }

    get blueprint(): Blueprint {
        return this.parent.blueprint;
    }

    get stage(): PIXI.Container {
        return this.blueprint.stage;
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

    get fontSize(): number {
        return 14;
    }

    get padding(): number {
        return 10;
    }

    get canDrag(): boolean {
        return true;
    }

    get headerColor(): PIXI.Color | number {
        return 0x0;
    }

    get opacity(): number {
        return 0.6;
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

    getEntryFromId(id: NodeEntryId): BlueprintNodeEntry | undefined {
        return this.#body.getEntryFromId(id);
    }

    getEntryFromType(
        category: NodeEntryCategory,
        type: NodeEntryType | undefined
    ): BlueprintNodeEntry | undefined {
        return this.#body.getEntryFromType(category, type);
    }

    bringToTop() {
        const highest = R.firstBy(this.parent.children, [R.prop("zIndex"), "desc"])?.zIndex ?? 0;
        this.zIndex = highest + 1;
        this.parent.sortChildren();
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

    onDropItem(point: Point, item: ItemPF2e | CompendiumIndexData): boolean {
        for (const entry of this.#body.entries()) {
            const dropped = entry.onDropItem(point, item);
            if (dropped) return true;
        }
        return false;
    }

    refresh() {
        console.log(this);
        const removed = this.removeChildren();

        for (let i = 0; i < removed.length; ++i) {
            removed[i].destroy(true);
        }

        this.#header = this.title ? new BlueprintNodeHeader(this) : null;
        this.#body = new BlueprintNodeBody(this);
        this.#border = new BlueprintNodeBorder(this);

        this.#paint();
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

    #paint() {
        const maxInner = Math.max(this.#header?.innerWidth ?? 0, this.#body.innerWidth);
        const maxWidth = maxInner + this.padding * 2;

        this.#body.y = this.#header?.outerHeight ?? 0;

        this.#header?.paint(maxWidth);
        this.#body.paint(maxWidth);
        this.#border.paint(maxWidth);
    }

    #onPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        if (event.button === 0) {
            this.bringToTop();
            this.#onDragStart(event);
        }
    }

    #onDragStart(event: PIXI.FederatedPointerEvent) {
        this.#dragOffset = event.getLocalPosition(this);

        this.stage.on("pointerup", this.#onDragEnd, this);
        this.stage.on("pointerupoutside", this.#onDragEnd, this);
        this.stage.on("pointermove", this.#onDragMove, this);
    }

    setPosition(x: number, y: number): void;
    setPosition(point: Point): void;
    setPosition(xOrPoint: Point | number, y: number = 0) {
        const position = R.isNumber(xOrPoint) ? { x: xOrPoint, y } : xOrPoint;
        this.position.set(position.x, position.y);
    }

    #onDragMove(event: PIXI.FederatedPointerEvent) {
        const position = subtractPoints(event.global, this.#dragOffset);
        const newPosition = this.stage.toLocal(position);

        this.setPosition(newPosition);
        this.blueprint.layers.connections.updateConnections(this);
    }

    #onDragEnd(event: PIXI.FederatedPointerEvent) {
        // TODO we need to save the new coordinates

        this.stage.off("pointerup", this.#onDragEnd, this);
        this.stage.off("pointerupoutside", this.#onDragEnd, this);
        this.stage.off("pointermove", this.#onDragMove, this);
    }
}

interface BlueprintNode extends PIXI.Container {
    parent: BlueprintNodesLayer;
}

export { BlueprintNode };
