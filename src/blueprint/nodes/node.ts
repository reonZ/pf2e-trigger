import {
    Blueprint,
    BlueprintEntry,
    BlueprintMenu,
    BlueprintWaitContextData,
    getElementSize,
    HorizontalLayoutGraphics,
    VerticalLayoutGraphics,
} from "blueprint";
import {
    NodeCustomEntryType,
    NodeEntryCategory,
    NodeEntryId,
    NodeEntryValue,
    NodeType,
    TriggerData,
    TriggerNodeData,
} from "data";
import {
    addToPoint,
    confirmDialog,
    drawCircleMask,
    drawRectangleMask,
    localize,
    localizeIfExist,
    R,
    subtractPoint,
    waitDialog,
} from "module-helpers";
import {
    BaseNodeSchemaEntry,
    hasInBridge,
    hasOuts,
    IconObject,
    isGetter,
    isValue,
    isVariable,
    NodeCustomEntryCategory,
    NodeKey,
    NodeSchemaEntry,
    NodeSchemaModel,
} from "schema";

const NODE_ICONS: PartialRecord<NodeType, IconObject> = {
    condition: { unicode: "\ue14f", fontWeight: "400" },
    macro: { unicode: "\uf121", fontWeight: "400" },
    splitter: { unicode: "\ue254", fontWeight: "400" },
};

const HEADER_COLOR: Record<NodeType, number> = {
    action: 0x2162bd,
    condition: 0x188600,
    event: 0xc40000,
    logic: 0x7e18b5,
    macro: 0xa1733f,
    splitter: 0x7e18b5,
    subtrigger: 0xc40000,
    value: 0x757575,
    variable: 0x2e2e2e,
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
        return this.data.isEvent;
    }

    get isValue(): boolean {
        return isValue(this);
    }

    get isVariable(): boolean {
        return isVariable(this);
    }

    get isGetter(): boolean {
        return isGetter(this);
    }

    get isSubtriggerNode(): boolean {
        return this.data.isSubtriggerNode;
    }

    get hasHeader(): boolean {
        return !this.isValue && !this.isGetter;
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

    get targetLabel(): string | undefined {
        return this.isVariable
            ? this.trigger?.getVariable(this.data.target as NodeEntryId)?.label
            : this.isSubtriggerNode
            ? this.blueprint.triggers.get(this.data.target as string)?.label
            : undefined;
    }

    get title(): string {
        return this.targetLabel ?? localize(this.localizePath, "label");
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

    get helperIcon(): IconObject | undefined {
        return this.isCustom ? { unicode: "\uf013", fontWeight: "900" } : undefined;
    }

    get isCustom(): boolean {
        return !!this.schema.custom?.length;
    }

    get backgroundColor(): number {
        return 0x000000;
    }

    get headerColor(): number {
        return HEADER_COLOR[this.type] ?? this.backgroundColor;
    }

    get borderRadius(): number {
        return 10;
    }

    get entryHeight(): number {
        return this.fontSize * 1.5;
    }

    get canDrag(): boolean {
        return !this.isEvent;
    }

    get contextEntries(): NodeContextData[] {
        const entries: NodeContextData[] = [];

        if (!this.isEvent) {
            entries.push({ value: "delete-node" }, { value: "duplicate-node" });
        }

        if (this.isVariable) {
            const variable = this.trigger?.getVariable(this.data.target as NodeEntryId);

            if (variable && !variable.locked) {
                entries.push({ value: "delete-variable" }, { value: "edit-variable" });
            }
        }

        if (this.isCustom) {
            for (const { category, group } of this.schema.custom) {
                entries.push({
                    value: "create-entry",
                    category,
                    group,
                    label: group ? this.getGroupLabel(group) : localize(category, "singular"),
                });
            }
        }

        return entries;
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

    setPosition({ x, y }: Point) {
        this.position.set(x, y);
        this.data.update({ position: { x, y } });

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

        this.data.delete();
        this.blueprint.refresh();
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

    getGroupLabel(group: string) {
        return (
            localizeIfExist(this.localizePath, "group", group) ??
            localizeIfExist("node", group) ??
            game.i18n.localize(group)
        );
    }

    fontAwesomeIcon(icon: IconObject | string): PreciseText {
        const unicode = R.isString(icon) ? icon : icon.unicode;
        const fontWeight = R.isString(icon) ? "400" : icon.fontWeight;

        return this.preciseText(
            unicode,
            foundry.utils.mergeObject({ fontFamily: "Font Awesome 6 Pro" }, { fontWeight })
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
            this.schema[category] as NodeSchemaEntry[],
            R.groupBy(R.prop("group")),
            R.entries(),
            R.map(([group, entries]) => ({
                group,
                entries: entries.map((schema) => new BlueprintEntry(this, category, schema)),
            })),
            R.sortBy(R.prop("group"))
        );

        const bridges: BaseNodeSchemaEntry[] =
            category === "outputs" && hasOuts(this)
                ? this.schema.outs
                : category === "inputs" && hasInBridge(this)
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
                    const groupLabel = this.getGroupLabel(group);
                    const entry = this.preciseText(groupLabel);
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

    #drawHelper(): PIXI.Graphics | undefined {
        const helperIcon = this.helperIcon;
        if (!helperIcon) return;

        const icon = this.fontAwesomeIcon(helperIcon);
        icon.x = (icon.width / 2) * -1;
        icon.y = (icon.height / 2) * -1;

        const helper = new PIXI.Graphics();
        const color = this.headerColor;
        const radius = icon.width * 0.8;
        const mask = drawCircleMask(0, 0, radius);

        helper.beginFill(color, this.opacity);
        helper.lineStyle({ color: 0x0, width: 2, alpha: 0.8 });
        helper.drawCircle(0, 0, radius);
        helper.endFill();

        helper.mask = mask;
        helper.addChild(icon, mask);

        return helper;
    }

    #draw() {
        const header = this.#drawHeader();
        const body = this.#drawBody();
        const helper = this.#drawHelper();
        const outerPadding = this.outerPadding;

        const totalWidth = Math.max(body.totalWidth, Math.clamp(header?.totalWidth ?? 0, 100, 200));
        const totalHeight = (header?.totalHeight ?? 0) + body.totalHeight;

        // we draw them after calculating the totalWidth & totalHeight
        const background = this.#drawBackground(totalWidth, totalHeight);
        const border = this.#drawBorder(totalWidth, totalHeight);
        const backgroundMask = drawRectangleMask(0, 0, totalWidth, totalHeight, 10);

        if (header) {
            const title = header.titleElement;
            const color = this.headerColor;
            const maxTextWidth = totalWidth - outerPadding.x - header.titleElement.x;

            if (title.width > maxTextWidth) {
                const headerMask = drawRectangleMask(0, 0, maxTextWidth, title.height);

                title.mask = headerMask;
                title.addChild(headerMask);
            }

            header.beginFill(color, this.opacity);
            header.drawRect(0, 0, totalWidth, header.totalHeight);
            header.endFill();

            body.y += header.totalHeight;

            background.addChild(header);
        }

        if (body.totalWidth < totalWidth) {
            body.outputs.x = totalWidth - outerPadding.x - body.outputs.totalWidth;
        }

        background.mask = backgroundMask;
        background.addChild(body, border, backgroundMask);

        this.addChild(background);

        if (helper) {
            helper.x = totalWidth + helper.width * -0.25;
            helper.y = helper.height * 0.2;

            this.addChild(helper);
        }
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
                return this.#delete();
            }

            case "duplicate-node": {
                return this.duplicate();
            }

            case "delete-variable": {
                return this.blueprint.deleteVariable(this.data.target as NodeEntryId);
            }

            case "edit-variable": {
                return this.blueprint.editVariable(this.data.target as NodeEntryId);
            }

            case "create-entry": {
                return this.#createCustomEntry(result);
            }
        }
    }

    async #delete() {
        const result = await confirmDialog("delete-node", {
            skipAnimate: true,
        });

        if (result) {
            this.delete();
        }
    }

    async #createCustomEntry({ category, group }: NodeContextData) {
        const custom = this.schema.custom?.find(
            (custom) => custom.category === category && custom.group === (group ?? "")
        );
        if (!category || !custom) return;

        const result = await waitDialog<{ label: string; type: NodeCustomEntryType }>({
            content: [
                {
                    type: "text",
                    inputConfig: {
                        name: "label",
                    },
                },
                {
                    type: "select",
                    inputConfig: {
                        name: "type",
                        options: custom.types,
                        i18n: "entry",
                        disabled: custom.types.length === 1,
                    },
                },
            ],
            i18n: "create-entry",
            skipAnimate: true,
            data: {
                label: group ? this.getGroupLabel(group) : localize(category, "singular"),
            },
        });

        if (result) {
            this.data.addCustomEntry({ ...result, category, group });
            this.blueprint.refresh();
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

type NodeContextValue =
    | "delete-node"
    | "duplicate-node"
    | "edit-variable"
    | "delete-variable"
    | "create-entry";

type NodeContextData = BlueprintWaitContextData<NodeContextValue> & {
    category?: NodeCustomEntryCategory;
    group?: string;
    label?: string;
};

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
