import { PixiLayoutGraphics } from "blueprint";
import { NodeEntryCategory, NodeEntryType, NodeType, TriggerNode } from "data";
import { localize, localizeIfExist, R } from "module-helpers";
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

    constructor(data: TriggerNode) {
        super();

        this.#data = data;
        this.#schema = getSchema(data)!;

        this.x = data.position.x;
        this.y = data.position.y;

        this.#draw();
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
        return localize(this.localizePath, "title");
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

    get rowHeight(): number {
        return this.fontSize * 1.16;
    }

    #draw() {
        const header = this.#drawHeader();
        const body = this.#drawBody();
        const outerPadding = this.outerPadding;
        // TODO body.outputs.x needs to be reajusted based on totalWidth
        const totalWidth = Math.max(body.totalWidth, Math.clamp(header?.totalWidth ?? 0, 100, 200));
        const totalHeight = (header?.totalHeight ?? 0) + body.totalHeight;

        const background = this.#drawBackground(totalWidth, totalHeight);
        this.addChild(background);

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

            this.addChild(header);
            body.y = header.totalHeight;
        }

        if (body.totalWidth < totalWidth) {
            body.outputs.x = totalWidth - outerPadding.x - body.outputs.totalWidth;
        }

        const border = this.#drawBorder(totalWidth, totalHeight);
        const mask = this.#drawMask(totalWidth, totalHeight);

        this.mask = mask;
        this.addChild(body, border, mask);
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

    #getEntries(category: NodeEntryCategory): BlueprintEntriesGroup[] {
        const groups: BlueprintEntriesGroup[] = R.pipe(
            [...this.#schema[category], ...(this.#data.custom?.[category] ?? [])],
            R.groupBy(R.prop("group")),
            R.entries(),
            R.map(([title, entries]) => ({
                title,
                entries: entries.map((entry) => this.#drawEntry(entry, category)),
            })),
            R.sortBy(R.prop("title"))
        );

        const bridges: NodeEntry[] =
            category === "outputs"
                ? [...this.#schema.outs, ...(this.#data.custom?.outs ?? [])]
                : this.hasInBridge
                ? [{ key: "in", type: "bridge" }]
                : [];

        if (bridges.length) {
            groups.unshift({
                title: "",
                entries: bridges.map((entry) => this.#drawEntry(entry, category)),
            });
        }

        return groups;
    }

    #drawConnector(entry: NodeEntry): PIXI.Container {
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
            connector.drawCircle(5, 6, 6);
        }

        connector.endFill();

        return connector;
    }

    #drawEntry(entry: NodeEntry, category: NodeEntryCategory): PixiLayoutGraphics {
        const container = new PixiLayoutGraphics("horizontal", 5);
        const connector = this.#drawConnector(entry);

        if (category === "inputs") {
            container.addToLayout(connector);
        } else {
            container.addToLayout(connector);
        }

        return container;
    }

    #drawBody(): BlueprintNodeBody {
        const rowHeight = this.rowHeight;
        const outerPadding = this.outerPadding;
        // const body = new BlueprintNodeBody(colSpacing, 0);
        const inputEntries = this.#getEntries("inputs");
        const outputEntries = this.#getEntries("outputs");

        const body = new PixiLayoutGraphics("horizontal", 20, outerPadding) as BlueprintNodeBody;
        const inputs = (body.inputs = new PixiLayoutGraphics("vertical", 0));
        const outputs = (body.outputs = new PixiLayoutGraphics("vertical", 0));

        for (const { title, entries } of inputEntries) {
            if (!entries.length) continue;

            if (title) {
            }

            for (const entry of entries) {
                // TODO center entry elements
                inputs.addToLayout(entry);

                //         // entry.x = outerPadding.x;
                //         // entry.y = offset;
                //         body.inputs.addChild(entry);
                //         // if (entry.totalWidth > (body.inputs.totalWidth ??= 0)) {
                //         //     body.inputs.totalWidth = entry.totalWidth;
                //         // }
                //         // offset += rowHeight;
            }
        }

        // if (offset.x) {
        //     offset.x += outerPadding.x + colSpacing;
        // } else {
        //     offset.x = colSpacing;
        // }

        // offset.y = 0;

        // body.minWidth = offset.x;
        // body.totalHeight = offset.y;

        // const maxOutputWidth =
        //     R.pipe(
        //         outputEntries,
        //         R.flatMap((output) => output.entries),
        //         R.map((entry) => entry.totalWidth),
        //         R.firstBy([R.identity(), "desc"])
        //     ) ?? 0;

        for (const { title, entries } of outputEntries) {
            if (!entries.length) continue;

            if (title) {
            }

            for (const entry of entries) {
                // TODO center entry elements
                outputs.addToLayout(entry);

                //         // entry.x = offset.x + (maxOutputWidth - entry.totalWidth);
                //         // entry.y = offset.y;

                //         body.outputs.addChild(entry);

                //         // offset.y += rowHeight;
            }
        }

        body.addToLayout(inputs);
        body.addToLayout(outputs);

        // body.minWidth += maxOutputWidth + outerPadding.x;
        // body.totalHeight = Math.max(body.totalHeight, offset.y) + outerPadding.y;

        return body;
    }

    #drawHeader(): BlueprintNodeHeader | undefined {
        if (!this.hasHeader) return;

        const spacing = 5;
        const outerPadding = this.outerPadding;
        const header = new PixiLayoutGraphics("vertical", 0, {
            x: [0, outerPadding.x],
            y: outerPadding.y,
        }) as BlueprintNodeHeader;
        const firstRow = new PixiLayoutGraphics("horizontal", spacing);
        const icon = this.#drawIcon();
        const title = (header.titleElement = this.#drawTitle());
        const subtitle = this.#drawSubtitle();

        if (icon) {
            if (icon instanceof foundry.canvas.containers.PreciseText) {
                firstRow.addToLayout(icon, outerPadding.x);
            } else {
                icon.width = icon.height = title.height + outerPadding.y * 2;
                firstRow.addToLayout(icon);
            }
        }

        firstRow.addToLayout(title);
        header.addToLayout(firstRow);

        if (subtitle) {
            const offset = icon ? icon.x + icon.width + spacing : outerPadding.x + 2;
            header.addToLayout(subtitle, { x: offset });
        }

        return header;
    }

    #drawTitle(): PreciseText {
        const title = this.title;
        return this.#preciseText(title);
    }

    #drawIcon(): PreciseText | PIXI.Sprite | undefined {
        const icon = this.icon;
        return icon ? this.#fontAwesomeIcon(icon) : undefined;
    }

    #drawSubtitle(): PreciseText | undefined {
        const subtitle = this.subtitle;

        if (subtitle) {
            return this.#preciseText(subtitle, {
                fontSize: this.fontSize * 0.93,
                fontStyle: "italic",
                fill: "d9d9d9",
            });
        }
    }

    async #onConnectorPointerDown(event: PIXI.FederatedPointerEvent) {
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

    #fontAwesomeIcon(icon: IconObject) {
        return this.#preciseText(
            icon.unicode,
            foundry.utils.mergeObject(
                { fontFamily: "Font Awesome 6 Pro" },
                { fontWeight: icon.fontWeight }
            )
        );
    }

    #preciseText(text: string, options: Partial<PIXI.ITextStyle> = {}) {
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
}

function horizontalAlign(elements: PIXI.Container[], maxHeight?: number) {
    maxHeight ??= R.pipe(
        elements,
        R.map((el) => el.height),
        R.firstBy([R.identity(), "desc"])
    );

    if (!maxHeight) return;

    for (const el of elements) {
        el.y = (maxHeight - el.height) / 2;
    }
}

type NodeEntry = NodeRawSchemaEntry<NodeEntryType>;

type BlueprintEntriesGroup = {
    title: string;
    entries: PixiLayoutGraphics[];
};

type BlueprintNodeHeader = PixiLayoutGraphics & {
    titleElement: PreciseText;
};

type BlueprintNodeBody = PixiLayoutGraphics & {
    inputs: PixiLayoutGraphics;
    outputs: PixiLayoutGraphics;
};

export { BlueprintNode };
