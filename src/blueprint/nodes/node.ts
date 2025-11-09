import {
    Blueprint,
    BlueprintDropDocument,
    BlueprintEntry,
    BlueprintMenu,
    BlueprintWaitContextData,
    ENTRY_PADDING,
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
    CreateFormGroupParams,
    drawCircleMask,
    drawRectangleMask,
    isUuidOf,
    localize,
    localizeIfExist,
    R,
    subtractPoint,
    waitDialog,
    warning,
} from "module-helpers";
import {
    BaseNodeSchemaEntry,
    entrySchemaIsOfType,
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

class BlueprintNode extends PIXI.Container {
    #blueprint: Blueprint;
    #data: TriggerNodeData;
    #dragOffset: Point = { x: 0, y: 0 };
    #entries = {
        all: new Collection<BlueprintEntry>(),
        inputs: new Collection<BlueprintEntry>(),
        outputs: new Collection<BlueprintEntry>(),
    };

    static NODE_ICONS: PartialRecord<NodeType, IconObject> = {
        condition: { unicode: "\ue14f", fontWeight: "400" },
        splitter: { unicode: "\ue254", fontWeight: "400" },
    };

    static HEADER_COLOR: Record<NodeType, number> = {
        action: 0x2162bd,
        condition: 0x188600,
        event: 0xc40000,
        logic: 0x7e18b5,
        splitter: 0x7e18b5,
        subtrigger: 0xc40000,
        value: 0x757575,
        variable: 0x2e2e2e,
    };

    constructor(blueprint: Blueprint, data: TriggerNodeData) {
        super();

        this.#data = data;
        this.#blueprint = blueprint;

        this.x = data.position.x;
        this.y = data.position.y;

        this.#draw();

        if (this.canBeInteractedWith) {
            this.eventMode = "static";
            this.on("pointerdown", this.#onPointerDown, this);
        }
    }

    get data(): TriggerNodeData {
        return this.#data;
    }

    get canBeInteractedWith(): boolean {
        return !this.data.parent.module;
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

    get isTemporary(): boolean {
        return ["remove-temporary", "has-temporary"].includes(this.key);
    }

    get isGetter(): boolean {
        return isGetter(this);
    }

    get isSubtriggerNode(): boolean {
        return this.data.isSubtriggerNode;
    }

    get isSubtriggerOutput(): boolean {
        return this.data.isSubtriggerOutput;
    }

    get hasHeader(): boolean {
        return !this.isGetter;
    }

    get opacity(): number {
        return 0.6;
    }

    get fontSize(): number {
        return 15;
    }

    get localizePath(): string {
        return this.data.localizePath;
    }

    get outerPadding(): Point {
        return { x: 10, y: 4 };
    }

    get triggerModule(): string | undefined {
        return this.data.parent.module;
    }

    get temporaryLabel(): string | undefined {
        if (!this.isTemporary) return;

        const id = this.data.inputs.trigger?.value as string;
        const module = this.triggerModule;

        return this.blueprint.getTrigger({ id, module })?.label;
    }

    get targetLabel(): string | undefined {
        return this.isVariable
            ? this.trigger?.getVariable(this.data.target as NodeEntryId)?.label
            : this.isSubtriggerNode
            ? this.blueprint.getTrigger({ id: this.data.target, module: this.triggerModule })?.label
            : undefined;
    }

    get document(): Maybe<CompendiumIndexData> {
        const key = this.schema.document;
        const schema = key ? this.#data.schemaInputs.get(key) : undefined;
        if (!key || !schema || !entrySchemaIsOfType(schema, "uuid")) return;

        const uuid = this.getValue(key) as Maybe<string>;
        if (!uuid) return;

        return isUuidOf(uuid, schema.field.document)
            ? fromUuidSync<CompendiumIndexData>(uuid)
            : null;
    }

    get title(): string {
        const document = this.document;

        if (document === null) {
            return localize("document.broken");
        }

        return (
            document?.name ??
            this.targetLabel ??
            this.temporaryLabel ??
            localize(this.localizePath, "label")
        );
    }

    get subtitle(): string | undefined {
        if (this.isValue) return;

        if (this.document !== undefined || this.temporaryLabel) {
            return localize(this.localizePath, "label");
        }

        return (
            localizeIfExist(this.localizePath, "subtitle") ??
            localizeIfExist(this.data.rootLocalizePath, "subtitle")
        );
    }

    get isAwait(): boolean {
        return !!this.schema.await;
    }

    get isCustom(): boolean {
        return !!this.schema.custom?.length;
    }

    get isHalt(): boolean {
        return !!this.schema.halt;
    }

    get isAction(): boolean {
        return this.type === "action";
    }

    get isSplitter(): boolean {
        return this.type === "splitter";
    }

    get isMacro(): boolean {
        return this.isAction && this.key === "use-macro";
    }

    get isLoop(): boolean {
        return !!this.schema.loop;
    }

    get backgroundColor(): number {
        return 0x000000;
    }

    get headerColor(): number {
        return BlueprintNode.HEADER_COLOR[this.type] ?? this.backgroundColor;
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

        if (this.isVariable) {
            const variable = this.trigger?.getVariable(this.data.target as NodeEntryId);

            if (variable && !variable.locked) {
                entries.push({ value: "delete-variable" }, { value: "edit-variable" });
            }
        }

        if (!this.isEvent && !this.isSubtriggerOutput) {
            entries.push({ value: "delete-node" }, { value: "duplicate-node" });
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
                    return {
                        "-=ids": null,
                        value,
                    };
                }),
                "-=outputs": null,
            },
            { keepId: false }
        );

        this.trigger?.nodes.set(node.id, node, { modifySource: true });
        this.blueprint.nodesLayer.add(node);
    }

    contains({ x, y }: Point): boolean {
        return this.getBounds().contains(x, y);
    }

    onDropDocument(point: Point, type: string, document: BlueprintDropDocument): boolean {
        if (!this.contains(point)) {
            return false;
        }

        for (const entry of this.entries("inputs")) {
            if (entry.onDropDocument(point, type, document)) {
                break;
            }
        }

        return true;
    }

    /**
     * return null if the point hits the node but no entry
     * return undefined if the point isn't contained in the node at all
     */
    testConnection(point: Point, otherEntry: BlueprintEntry): BlueprintEntry | null | undefined {
        if (!this.contains(point)) return;

        for (const entry of this.entries(otherEntry.oppositeCategory)) {
            if (entry.testConnection(point, otherEntry)) {
                return entry;
            }
        }

        return null;
    }

    getValue(key: string): NodeEntryValue {
        return this.data.getValue(key);
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

    fontAwesomeIcon(icon: IconObject | string, fontSize?: number): PreciseText {
        const unicode = R.isString(icon) ? icon : icon.unicode;
        const fontWeight = R.isString(icon) ? "400" : icon.fontWeight;

        return this.preciseText(unicode, {
            fontFamily: "Font Awesome 6 Pro",
            fontWeight,
            fontSize,
        });
    }

    preciseText(text: string, options: Partial<PIXI.ITextStyle> = {}): PreciseText {
        if (!R.isNumber(options.fontSize)) {
            delete options.fontSize;
        }

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
                    const container = new HorizontalLayoutGraphics({
                        maxHeight: this.entryHeight,
                        padding: ENTRY_PADDING,
                    });
                    const entry = this.preciseText(groupLabel);

                    container.addChild(entry);
                    body[category].addChild(container);
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
        const icon = this.#drawIcon();
        const title = this.preciseText(this.title);
        const subtitle = this.#drawSubtitle();
        const iconIsImage = !!icon && !(icon instanceof foundry.canvas.containers.PreciseText);

        const padding: { x: [number, number]; y: number } = {
            x: [this.outerPadding.x, this.outerPadding.x],
            y: this.outerPadding.y,
        };

        if (iconIsImage) {
            icon.width = title.height + this.outerPadding.y * 2;
            icon.height = icon.width;

            padding.x[0] = 0;
            padding.y = 0;
        }

        const header = new VerticalLayoutGraphics({ padding }) as NodeHeader;
        const firstRow = new HorizontalLayoutGraphics({ spacing });

        header.titleElement = title;

        if (icon) {
            firstRow.addChild(icon);
        }

        firstRow.addChild(title);
        header.addChild(firstRow);

        if (subtitle) {
            const offset = icon ? elementOffset(icon, "x") + spacing : 2;

            header.addChildWithOffset(subtitle, offset);

            if (iconIsImage) {
                subtitle.y -= this.outerPadding.y;
            }
        }

        return header;
    }

    #drawIcon(): PreciseText | PIXI.Sprite | undefined {
        const document = this.document;

        if (document === null) {
            return this.fontAwesomeIcon("\uf127");
        }

        if (document?.img) {
            return PIXI.Sprite.from(document.img);
        }

        if (this.temporaryLabel) {
            return this.fontAwesomeIcon("\uf1e6");
        }

        if (this.schema.image) {
            const image = this.data.inputs[this.schema.image]?.value as Maybe<string>;

            if (image) {
                return PIXI.Sprite.from(image);
            }
        }

        const icon = this.schema.icon ?? BlueprintNode.NODE_ICONS[this.type];
        return icon ? this.fontAwesomeIcon(icon) : undefined;
    }

    #drawSubtitle(): PreciseText | undefined {
        const subtitle = this.subtitle;
        if (!subtitle) return;

        return this.preciseText(subtitle, {
            fontSize: this.fontSize * 0.93,
            fontStyle: "italic",
            fill: "d9d9d9",
        });
    }

    #drawSpecials(): PIXI.Graphics[] {
        return R.pipe(
            [
                [this.isAwait, "\uf1eb", 0.74],
                [this.isCustom, "\uf013", 0.86],
                [this.isHalt, "\uf127", 0.74],
                [this.isLoop, "\uf363", 0.86],
            ] as const,
            R.filter(([condition]) => condition),
            R.map(([_, unicode, fontSize]) => {
                const icon = this.fontAwesomeIcon(
                    { unicode, fontWeight: "900" },
                    this.fontSize * fontSize
                );

                const helper = new PIXI.Graphics();
                const color = this.headerColor;
                const x = 13 / 2;
                const y = 14 / 2;
                const radius = 13 * 0.8;

                helper.beginFill(color, this.opacity);
                helper.lineStyle({ color: 0x0, width: 2, alpha: 0.8 });
                helper.drawCircle(x, y, radius);
                helper.endFill();

                const mask = drawCircleMask(x, y, radius);

                helper.mask = mask;
                helper.addChild(icon, mask);

                return helper;
            })
        );
    }

    #draw() {
        const header = this.#drawHeader();
        const body = this.#drawBody();
        const specials = this.#drawSpecials();
        const outerPadding = this.outerPadding;

        const minClamp = header ? 180 : 100;
        const headerWidth = Math.clamp(header?.totalWidth ?? 0, minClamp, 250);
        const totalWidth = Math.max(body.totalWidth, headerWidth);
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

        if (specials.length) {
            const helpers = new HorizontalLayoutGraphics();

            for (const special of specials) {
                helpers.addChild(special);
            }

            helpers.x = totalWidth - helpers.width + specials[0].width * 0.4;
            helpers.y = helpers.height * -0.15;

            this.addChild(helpers);
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

        const value = result.value;

        if (value === "create-entry") {
            this.#createCustomEntry(result);
        } else if (value === "delete-node") {
            this.#delete();
        } else if (value === "delete-variable") {
            this.blueprint.deleteVariable(this.data.target as NodeEntryId);
        } else if (value === "duplicate-node") {
            this.duplicate();
        } else if (value === "edit-variable") {
            this.blueprint.editVariable(this.data.target as NodeEntryId);
        }
    }

    async #delete() {
        const result = await confirmDialog("delete-node", {
            skipAnimate: true,
            data: this,
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

        const customKey = !!custom.key?.name && localize("create-entry", custom.key.name, "label");
        const content: CreateFormGroupParams[] = [];
        const noLabel = custom.key?.label === false;

        if (!noLabel) {
            content.push({
                type: "text",
                inputConfig: {
                    name: "label",
                },
            });
        }

        if (custom.types.length) {
            content.push({
                type: "select",
                inputConfig: {
                    name: "type",
                    options: custom.types,
                    i18n: "entry",
                },
            });
        }

        if (customKey) {
            content.unshift({
                type: custom.key.type,
                inputConfig: {
                    name: "key",
                },
                groupConfig: {
                    label: customKey,
                },
            });
        }

        const result = await waitDialog<{
            label?: string;
            type: NodeCustomEntryType;
            key?: string | number;
        }>({
            content,
            disabled: true,
            i18n: "create-entry",
            skipAnimate: true,
            data: {
                label: group ? this.getGroupLabel(group) : localize(category, "singular"),
            },
        });

        if (!result) return;

        const { key, label, type } = result;

        if (custom.key?.required && !key) {
            warning("create-entry.required", { name: customKey });
            return;
        }

        const isNumber = R.isNumber(key);
        const prefixIt = (value: string = "") => {
            return custom.key?.prefix ? `${custom.key?.prefix}${value.replace(/\s/gm, "")}` : value;
        };

        this.data.addCustomEntry({
            category,
            group,
            key: isNumber ? String(key) : key,
            label: noLabel ? (isNumber ? String(key) : prefixIt(key)) : prefixIt(label),
            type,
        });

        this.blueprint.refresh();
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
