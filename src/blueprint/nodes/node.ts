import {
    Blueprint,
    BlueprintNodesLayer,
    getElementSize,
    HorizontalLayoutGraphics,
    VerticalLayoutGraphics,
} from "blueprint";
import { NodeEntryCategory, NodeEntryType, NodeType, TriggerNode } from "data";
import { localize, localizeIfExist, MODULE, R, subtractPoint } from "module-helpers";
import { getSchema, IconObject, NodeKey, NodeRawSchemaEntry, NodeSchemaModel } from "schema";

const NODE_ICONS: PartialRecord<NodeType, IconObject> = {};

const HEADER_COLOR: PartialRecord<NodeType, number> = {
    event: 0xc40000,
};

const CONNECTOR_COLOR: Record<NodeEntryType, number> = {
    boolean: 0xad0303,
    bridge: 0xffffff,
    dc: 0x1682c9,
    duration: 0x75db32,
    item: 0x696fe0,
    list: 0x874501,
    number: 0x07b88f,
    roll: 0x86910d,
    select: 0xe0a06c,
    target: 0xff3075,
    text: 0xe0a06c,
};

class BlueprintNode extends PIXI.Container {
    #data: TriggerNode;
    #schema: NodeSchemaModel;
    #dragOffset: Point = { x: 0, y: 0 };

    constructor(data: TriggerNode) {
        super();

        this.#data = data;
        this.#schema = getSchema(data)!;

        this.x = data.position.x;
        this.y = data.position.y;

        this.#draw();

        this.eventMode = "static";
        this.on("pointerdown", this.#onPointerDown, this);

        MODULE.log(this);
    }

    get blueprint() {
        return this.parent.blueprint;
    }

    get stage(): PIXI.Container {
        return this.blueprint.stage;
    }

    get id(): string {
        return this.#data.id;
    }

    get type(): NodeType {
        return this.#data.type;
    }

    get key(): NodeKey {
        return this.#data.key;
    }

    get isValue(): boolean {
        return this.type === "value";
    }

    get isVariable(): boolean {
        return this.type === "variable";
    }

    get isEvent(): boolean {
        return this.type === "event";
    }

    get isSubTrigger(): boolean {
        return this.type === "subtrigger";
    }

    get hasHeader(): boolean {
        return !this.isValue && (!this.isVariable || this.key !== "getter");
    }

    get hasInBridge(): boolean {
        return (
            !this.isValue &&
            !this.isEvent &&
            (!this.isVariable || this.key !== "getter") &&
            (!this.isSubTrigger || this.key !== "subtrigger-input")
        );
    }

    get opacity(): number {
        return 0.6;
    }

    get fontSize(): number {
        return 15;
    }

    get nodeLocalizePath(): string {
        return `node.${this.type}`;
    }

    get localizePath(): string {
        return `${this.nodeLocalizePath}.${this.key}`;
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
            localizeIfExist(this.nodeLocalizePath, "subtitle")
        );
    }

    get icon(): IconObject | undefined {
        return this.#schema.icon ?? NODE_ICONS[this.type];
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

    bringToTop() {
        const highest = R.firstBy(this.parent.children, [R.prop("zIndex"), "desc"])?.zIndex ?? 0;
        this.zIndex = highest + 1;
        this.parent.sortChildren();
    }

    setPosition({ x, y }: Point) {
        this.position.set(x, y);
        this.#data.update({ position: { x, y } });
        // TODO update connections
    }

    fontAwesomeIcon(icon: IconObject) {
        return this.preciseText(
            icon.unicode,
            foundry.utils.mergeObject(
                { fontFamily: "Font Awesome 6 Pro" },
                { fontWeight: icon.fontWeight }
            )
        );
    }

    preciseText(text: string, options: Partial<PIXI.ITextStyle> = {}) {
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

    drawMask(width: number, height: number): PIXI.Graphics {
        const mask = new PIXI.Graphics();

        mask.beginFill(0x555555);
        mask.drawRoundedRect(0, 0, width, height, 10);
        mask.endFill();

        return mask;
    }

    drawBorder(width: number, height: number): PIXI.Graphics {
        const border = new PIXI.Graphics();

        border.clear();
        border.lineStyle({ color: 0x0, width: 2, alpha: 0.8 });
        border.drawRoundedRect(0, 0, width, height, this.borderRadius);

        return border;
    }

    drawBackground(width: number, height: number): PIXI.Graphics {
        const background = new PIXI.Graphics();

        background.beginFill(this.backgroundColor, this.opacity);
        background.drawRect(0, 0, width, height);
        background.endFill();

        return background;
    }

    drawEntries(category: NodeEntryCategory): EntriesGroup[] {
        const groups: EntriesGroup[] = R.pipe(
            [...this.#schema[category], ...(this.#data.custom?.[category] ?? [])],
            R.groupBy(R.prop("group")),
            R.entries(),
            R.map(([group, entries]) => ({
                group,
                entries: entries.map((entry) => this.drawEntry(entry, category)),
            })),
            R.sortBy(R.prop("group"))
        );

        const bridges: NodeEntry[] =
            category === "outputs"
                ? [...this.#schema.outs, ...(this.#data.custom?.outs ?? [])]
                : this.hasInBridge
                ? [{ key: "in", type: "bridge" }]
                : [];

        if (bridges.length) {
            groups.unshift({
                group: "",
                entries: bridges.map((entry) => this.drawEntry(entry, category)),
            });
        }

        return groups;
    }

    drawConnector(entry: NodeEntry): PIXI.Graphics {
        const connector = new PIXI.Graphics();
        const color = CONNECTOR_COLOR[entry.type];

        connector.cursor = "pointer";
        connector.eventMode = "static";
        connector.hitArea = new PIXI.Rectangle(0, 0, 12, 12);
        connector.on("pointerdown", this.#onConnectorPointerDown, this);

        // if (isActive) { // TODO
        //     connector.beginFill(color);
        // }

        if (entry.type === "bridge") {
            connector.lineStyle({ color, width: 1 });
            connector.moveTo(0, 0);
            connector.lineTo(6, 0);
            connector.lineTo(12, 6);
            connector.lineTo(6, 12);
            connector.lineTo(0, 12);
            connector.lineTo(0, 0);
        } else {
            connector.lineStyle({ color, width: 2 });
            connector.drawCircle(6, 6, 6.5);
        }

        connector.endFill();

        return connector;
    }

    drawGroupEntry(group: string) {
        const label =
            localizeIfExist(this.localizePath, "label", group) ??
            localizeIfExist("node", group) ??
            game.i18n.localize(group);
        return this.preciseText(label);
    }

    drawField(entry: NodeEntry, category: NodeEntryCategory) {
        const label = entry.label
            ? localizeIfExist(entry.label) ?? game.i18n.localize(entry.label)
            : localizeIfExist(this.localizePath, "entry", entry.key) ??
              localize("entry", entry.key);

        if (category === "outputs") {
            return this.preciseText(label);
        }

        switch (entry.type) {
            case "select":
            case "text":
            case "number":
            case "boolean":

            default: {
                return this.preciseText(label);
            }
        }
    }

    drawEntry(entry: NodeEntry, category: NodeEntryCategory): HorizontalLayoutGraphics {
        const container = new HorizontalLayoutGraphics({ spacing: 5, maxHeight: this.entryHeight });
        const connector = this.drawConnector(entry);
        const field = this.drawField(entry, category);

        if (category === "inputs") {
            container.addChild(connector, field);
        } else {
            container.addChild(field, connector);
        }

        if (entry.type === "bridge") {
            connector.y += 1;
        } else {
            connector.x += category === "inputs" ? -1.5 : 1.5;
            connector.y += 1.5;
        }

        return container;
    }

    drawBody(): NodeBody {
        const body = new HorizontalLayoutGraphics({
            spacing: 20,
            padding: {
                x: this.outerPadding.x,
                y: [this.outerPadding.y, this.outerPadding.y],
            },
        }) as NodeBody;

        const inputs = (body.inputs = new VerticalLayoutGraphics());
        const outputs = (body.outputs = new VerticalLayoutGraphics({ align: "end" }));

        for (const category of ["inputs", "outputs"] as const) {
            for (const { group, entries } of this.drawEntries(category)) {
                if (!entries.length) continue;

                if (group) {
                    const entry = this.drawGroupEntry(group);
                    body[category].addChild(entry);
                }

                for (const entry of entries) {
                    body[category].addChild(entry);
                }
            }
        }

        body.addChild(inputs);
        body.addChild(outputs);

        return body;
    }

    drawHeader(): NodeHeader | undefined {
        if (!this.hasHeader) return;

        const spacing = 5;
        const header = new VerticalLayoutGraphics({
            padding: this.outerPadding,
        }) as NodeHeader;
        const firstRow = new HorizontalLayoutGraphics({ spacing });
        const title = (header.titleElement = this.drawTitle());
        const icon = this.drawIcon();
        const subtitle = this.drawSubtitle();

        if (icon) {
            firstRow.addChild(icon);
        }

        firstRow.addChild(title);
        header.addChild(firstRow);

        if (subtitle) {
            const offset = icon ? elementOffset(icon, "x") + spacing : 2;
            header.addChildWithOffset(subtitle, offset);
        }

        // if (icon instanceof foundry.canvas.containers.PreciseText) {
        //     firstRow.x = this.outerPadding.x;

        //     if (subtitle) {
        //         subtitle.x += this.outerPadding.x;
        //     }
        // }

        return header;
    }

    drawTitle(): PreciseText {
        const title = this.title;
        return this.preciseText(title);
    }

    drawIcon(): PreciseText | PIXI.Sprite | undefined {
        const icon = this.icon;
        return icon ? this.fontAwesomeIcon(icon) : undefined;
    }

    drawSubtitle(): PreciseText | undefined {
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
        const header = this.drawHeader();
        const body = this.drawBody();
        const outerPadding = this.outerPadding;

        const totalWidth = Math.max(body.totalWidth, Math.clamp(header?.totalWidth ?? 0, 100, 200));
        const totalHeight = (header?.totalHeight ?? 0) + body.totalHeight;

        // we add background first
        this.addChild(this.drawBackground(totalWidth, totalHeight));

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

        const border = this.drawBorder(totalWidth, totalHeight);
        const mask = this.drawMask(totalWidth, totalHeight);

        this.mask = mask;
        this.addChild(body, border, mask);
    }

    #onPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        if (event.button === 0 && this.canDrag) {
            this.bringToTop();
            this.#onDragStart(event);
        } else if (event.button === 2) {
            // this.#onContextMenu(event);
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

    #onConnectorPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        // if (event.button === 0 && this.canConnect) {
        //     this.blueprint.connections.startConnection(this);
        // } else if (event.button === 2) {
        //     const { x, y } = event.global;
        //     const context = this.node.getConnectionContext(this);
        //     if (!context.length) return;

        //     const result = await BlueprintSelectMenu.open(this.blueprint, { x, y }, context);
        //     if (!result) return;

        //     this.node["_onConnectionContext"](this, result);
        // }
    }
}

interface BlueprintNode extends PIXI.Container {
    parent: BlueprintNodesLayer;
}

function elementOffset(el: PIXI.Container, direction: "x" | "y") {
    return el[direction] + getElementSize(el, direction);
}

type NodeEntry = NodeRawSchemaEntry<NodeEntryType>;

type EntriesGroup = {
    group: string;
    entries: HorizontalLayoutGraphics[];
};

type NodeBody = HorizontalLayoutGraphics & {
    inputs: VerticalLayoutGraphics;
    outputs: VerticalLayoutGraphics;
};

type NodeHeader = VerticalLayoutGraphics & {
    titleElement: PreciseText;
};

export { BlueprintNode };
