import {
    Blueprint,
    BlueprintEntry,
    BlueprintMenu,
    EntrySchema,
    getElementSize,
    HorizontalLayoutGraphics,
    VerticalLayoutGraphics,
} from "blueprint";
import {
    NodeEntryCategory,
    NodeEntryId,
    NodeEntryValue,
    NodeType,
    TriggerData,
    TriggerNodeData,
    TriggerNodeDataSource,
} from "data";
import { addToPoint, localize, localizeIfExist, R, subtractPoint } from "module-helpers";
import {
    hasInBridge,
    hasOuts,
    IconObject,
    isEvent,
    isGetter,
    isValue,
    NodeKey,
    NodeSchemaModel,
} from "schema";

const NODE_ICONS: PartialRecord<NodeType, IconObject> = {
    condition: { unicode: "\ue14f", fontWeight: "400" },
    macro: { unicode: "\uf121", fontWeight: "400" },
    splitter: { unicode: "\ue254", fontWeight: "400" },
};

const HEADER_COLOR: PartialRecord<NodeType, number> = {
    action: 0x2162bd,
    condition: 0x188600,
    event: 0xc40000,
    logic: 0x7e18b5,
    macro: 0xa1733f,
    splitter: 0x7e18b5,
    subtrigger: 0xc40000,
    value: 0x757575,
};

class BlueprintNode extends PIXI.Container {
    #blueprint: Blueprint;
    #data: TriggerNodeData;
    #dragOffset: Point = { x: 0, y: 0 };
    #entries = {
        all: new Collection<BlueprintEntry>(),
        inputs: new Collection<BlueprintEntry>(),
        outputs: new Collection<BlueprintEntry>(),
    };

    constructor(blueprint: Blueprint, data: TriggerNodeData) {
        super();

        this.#data = data;
        this.#blueprint = blueprint;

        this.x = data.position.x;
        this.y = data.position.y;

        this.#draw();

        this.eventMode = "static";
        this.on("pointerdown", this.#onPointerDown, this);
    }

    get data(): TriggerNodeData {
        return this.#data;
    }

    get schema(): NodeSchemaModel {
        return this.data.nodeSchema;
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get trigger(): TriggerData | undefined {
        return this.blueprint.trigger;
    }

    get stage(): PIXI.Container {
        return this.blueprint.stage;
    }

    get id(): string {
        return this.data.id;
    }

    get type(): NodeType {
        return this.data.type;
    }

    get key(): NodeKey {
        return this.data.key;
    }

    get isEvent(): boolean {
        return isEvent(this);
    }

    get hasHeader(): boolean {
        return !isValue(this) && !isGetter(this);
    }

    get opacity(): number {
        return 0.6;
    }

    get fontSize(): number {
        return 15;
    }

    get rootLocalizePath(): string {
        return `node.${this.type}`;
    }

    get localizePath(): string {
        return `${this.rootLocalizePath}.${this.key}`;
    }

    get outerPadding(): Point {
        return { x: 10, y: 4 };
    }

    get title(): string {
        return localize(this.localizePath, "label");
    }

    get subtitle(): string | undefined {
        return (
            localizeIfExist(this.localizePath, "subtitle") ??
            localizeIfExist(this.rootLocalizePath, "subtitle")
        );
    }

    get icon(): IconObject | undefined {
        return this.schema.icon ?? NODE_ICONS[this.type];
    }

    get backgroundColor(): number {
        return 0x000000;
    }

    get borderRadius(): number {
        return 10;
    }

    get entryHeight(): number {
        return this.fontSize * 1.5;
    }

    get canDrag(): boolean {
        return this.type !== "event";
    }

    get contextEntries(): NodeContextValue[] {
        const entries: NodeContextValue[] = [];

        if (!this.isEvent) {
            entries.push("delete-node", "duplicate-node");
        }

        return entries;
    }

    destroy(options?: PIXI.IDestroyOptions | boolean) {
        this.data.delete();
        super.destroy(true);
    }

    *entries(
        category: NodeEntryCategory | "all" = "all"
    ): Generator<BlueprintEntry, void, undefined> {
        for (const entry of this.#entries[category]) {
            yield entry;
        }
    }

    getEntry(id: NodeEntryId): BlueprintEntry | undefined {
        return this.#entries.all.get(id);
    }

    bringToTop() {
        const highest = R.firstBy(this.parent.children, [R.prop("zIndex"), "desc"])?.zIndex ?? 0;
        this.zIndex = highest + 1;
        this.parent.sortChildren();
    }

    update(data: DeepPartial<TriggerNodeDataSource>): Promise<TriggerNodeData | undefined> {
        return this.data.update(data);
    }

    setPosition({ x, y }: Point) {
        this.position.set(x, y);
        this.update({ position: { x, y } });
        this.#updateConnections();
    }

    #updateConnections() {
        for (const entry of this.entries()) {
            for (const otherId of entry.connections) {
                const other = this.blueprint.getEntry(otherId);

                if (other && other.isConnectedTo(entry)) {
                    this.blueprint.connectionsLayer.update(entry, other);
                }
            }
        }
    }

    delete() {
        this.eventMode = "none";

        if (this.blueprint.nodesLayer.delete(this)) {
            this.destroy(true);
        }
    }

    async duplicate() {
        const node = this.data.clone(
            {
                position: addToPoint(this.data.position, 50),
                inputs: R.mapValues(this.data.inputs, ({ value }) => {
                    return { value: foundry.utils.deepClone(value) };
                }),
                outputs: {},
            },
            { keepId: false }
        );

        this.trigger?.nodes.set(node.id, node, { modifySource: true });
        this.blueprint.nodesLayer.add(node);
    }

    testContains({ x, y }: Point): boolean {
        return this.getBounds().contains(x, y);
    }

    /**
     * return null if the point hits the node but no entry
     * return undefined if the point isn't contained in the node at all
     */
    testConnection(point: Point, otherEntry: BlueprintEntry): BlueprintEntry | null | undefined {
        if (!this.testContains(point)) return;

        for (const entry of this.entries(otherEntry.oppositeCategory)) {
            if (entry.testConnection(point, otherEntry)) {
                return entry;
            }
        }

        return null;
    }

    getValue(id: NodeEntryId): NodeEntryValue {
        return this.data.getValue(id);
    }

    getConnections(id: NodeEntryId): NodeEntryId[] {
        return this.data.getConnections(id).filter((otherId) => {
            const otherNode = this.trigger?.getNode(otherId);
            return otherNode?.getConnections(otherId).includes(id);
        });
    }

    fontAwesomeIcon(icon: IconObject): PreciseText {
        return this.preciseText(
            icon.unicode,
            foundry.utils.mergeObject(
                { fontFamily: "Font Awesome 6 Pro" },
                { fontWeight: icon.fontWeight }
            )
        );
    }

    preciseText(text: string, options: Partial<PIXI.ITextStyle> = {}): PreciseText {
        const style = new PIXI.TextStyle(
            foundry.utils.mergeObject(
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

        return new foundry.canvas.containers.PreciseText(text, style);
    }

    #drawMask(width: number, height: number): PIXI.Graphics {
        const mask = new PIXI.Graphics();

        mask.beginFill(0x555555);
        mask.drawRoundedRect(0, 0, width, height, 10);
        mask.endFill();

        return mask;
    }

    #drawBorder(width: number, height: number): PIXI.Graphics {
        const border = new PIXI.Graphics();

        border.clear();
        border.lineStyle({ color: 0x0, width: 2, alpha: 0.8 });
        border.drawRoundedRect(0, 0, width, height, this.borderRadius);

        return border;
    }

    #drawBackground(width: number, height: number): PIXI.Graphics {
        const background = new PIXI.Graphics();

        background.beginFill(this.backgroundColor, this.opacity);
        background.drawRect(0, 0, width, height);
        background.endFill();

        return background;
    }

    #drawEntries(category: NodeEntryCategory): EntriesGroup[] {
        const groups: EntriesGroup[] = R.pipe(
            [...this.schema[category], ...(this.data.custom?.[category] ?? [])],
            R.groupBy(R.prop("group")),
            R.entries(),
            R.map(([group, entries]) => ({
                group,
                entries: entries.map((schema) => new BlueprintEntry(this, category, schema)),
            })),
            R.sortBy(R.prop("group"))
        );

        const bridges: EntrySchema[] =
            category === "outputs" && hasOuts(this)
                ? [...this.schema.outs, ...(this.data.custom?.outs ?? [])]
                : hasInBridge(this)
                ? [{ key: "in", type: "bridge" }]
                : [];

        if (bridges.length) {
            groups.unshift({
                group: "",
                entries: bridges.map((schema) => new BlueprintEntry(this, category, schema)),
            });
        }

        return groups;
    }

    #drawGroupEntry(group: string) {
        const label =
            localizeIfExist(this.localizePath, "label", group) ??
            localizeIfExist("node", group) ??
            game.i18n.localize(group);
        return this.preciseText(label);
    }

    #drawBody(): NodeBody {
        const body = new HorizontalLayoutGraphics({
            spacing: 20,
            align: "start",
            padding: {
                x: this.outerPadding.x,
                y: [this.outerPadding.y, this.outerPadding.y],
            },
        }) as NodeBody;

        const inputs = (body.inputs = new VerticalLayoutGraphics());
        const outputs = (body.outputs = new VerticalLayoutGraphics({
            align: "end",
            padding: { x: [0, -3], y: 0 },
        }));

        for (const category of ["inputs", "outputs"] as const) {
            for (const { group, entries } of this.#drawEntries(category)) {
                if (!entries.length) continue;

                if (group) {
                    const entry = this.#drawGroupEntry(group);
                    body[category].addChild(entry);
                }

                for (const entry of entries) {
                    this.#entries.all.set(entry.id, entry);
                    this.#entries[category].set(entry.id, entry);
                    body[category].addChild(entry);
                }
            }
        }

        body.addChild(inputs);
        body.addChild(outputs);

        return body;
    }

    #drawHeader(): NodeHeader | undefined {
        if (!this.hasHeader) return;

        const spacing = 5;
        const header = new VerticalLayoutGraphics({
            padding: this.outerPadding,
        }) as NodeHeader;
        const firstRow = new HorizontalLayoutGraphics({ spacing });
        const title = (header.titleElement = this.#drawTitle());
        const icon = this.#drawIcon();
        const subtitle = this.#drawSubtitle();

        if (icon) {
            firstRow.addChild(icon);
        }

        firstRow.addChild(title);
        header.addChild(firstRow);

        if (subtitle) {
            const offset = icon ? elementOffset(icon, "x") + spacing : 2;
            header.addChildWithOffset(subtitle, offset);
        }

        return header;
    }

    #drawTitle(): PreciseText {
        const title = this.title;
        return this.preciseText(title);
    }

    #drawIcon(): PreciseText | PIXI.Sprite | undefined {
        const icon = this.icon;
        return icon ? this.fontAwesomeIcon(icon) : undefined;
    }

    #drawSubtitle(): PreciseText | undefined {
        const subtitle = this.subtitle;

        if (subtitle) {
            return this.preciseText(subtitle, {
                fontSize: this.fontSize * 0.93,
                fontStyle: "italic",
                fill: "d9d9d9",
            });
        }
    }

    #draw() {
        const header = this.#drawHeader();
        const body = this.#drawBody();
        const outerPadding = this.outerPadding;

        const totalWidth = Math.max(body.totalWidth, Math.clamp(header?.totalWidth ?? 0, 100, 200));
        const totalHeight = (header?.totalHeight ?? 0) + body.totalHeight;

        // we add background first
        this.addChild(this.#drawBackground(totalWidth, totalHeight));

        if (header) {
            const title = header.titleElement;
            const color = HEADER_COLOR[this.type] ?? this.backgroundColor;
            const maxTextWidth = totalWidth - outerPadding.x - header.titleElement.x;

            if (title.width > maxTextWidth) {
                const mask = new PIXI.Graphics();

                mask.beginFill(0x555555);
                mask.drawRect(0, 0, maxTextWidth, title.height);
                mask.endFill();

                title.mask = mask;
                title.addChild(mask);
            }

            header.beginFill(color, this.opacity);
            header.drawRect(0, 0, totalWidth, header.totalHeight);
            header.endFill();

            body.y += header.totalHeight;

            this.addChild(header);
        }

        if (body.totalWidth < totalWidth) {
            body.outputs.x = totalWidth - outerPadding.x - body.outputs.totalWidth;
        }

        const border = this.#drawBorder(totalWidth, totalHeight);
        const mask = this.#drawMask(totalWidth, totalHeight);

        this.mask = mask;
        this.addChild(body, border, mask);
    }

    #onPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        if (event.button === 0 && this.canDrag) {
            this.bringToTop();
            this.#onDragStart(event);
        } else if (event.button === 2) {
            this.#onContextMenu(event);
        }
    }

    async #onContextMenu(event: PIXI.FederatedPointerEvent) {
        const { x, y } = event.global;
        const result = await BlueprintMenu.waitContext(this.blueprint, this.contextEntries, x, y);
        if (!result) return;

        switch (result.value) {
            case "delete-node": {
                return this.delete();
            }

            case "duplicate-node": {
                return this.duplicate();
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
        const position = subtractPoint(event.global, this.#dragOffset);
        const newPosition = this.stage.toLocal(position);
        this.setPosition(newPosition);
    }

    #onDragEnd(event: PIXI.FederatedPointerEvent) {
        this.stage.off("pointerup", this.#onDragEnd, this);
        this.stage.off("pointerupoutside", this.#onDragEnd, this);
        this.stage.off("pointermove", this.#onDragMove, this);
    }
}

function elementOffset(el: PIXI.Container, direction: "x" | "y") {
    return el[direction] + getElementSize(el, direction);
}

type NodeContextValue = "delete-node" | "duplicate-node";

type EntriesGroup = {
    group: string;
    entries: BlueprintEntry[];
};

type NodeBody = HorizontalLayoutGraphics & {
    inputs: VerticalLayoutGraphics;
    outputs: VerticalLayoutGraphics;
};

type NodeHeader = VerticalLayoutGraphics & {
    titleElement: PreciseText;
};

export { BlueprintNode };
