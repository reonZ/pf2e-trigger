import {
    Blueprint,
    BlueprintDropDocument,
    BlueprintEntry,
    BlueprintMenu,
    BlueprintNode,
} from "blueprint";
import { NodeEntryType, NodeEntryValue } from "data";
import {
    assignStyle,
    drawRectangleMask,
    isClientDocument,
    localizeIfExist,
    R,
    warning,
} from "module-helpers";
import { BaseNodeSchemaEntry, entrySchemaIsOfType } from "schema";

class EntryField extends PIXI.Graphics {
    #entry: BlueprintEntry;
    #overlay: PIXI.Graphics;
    #content: PIXI.Graphics | PreciseText;

    static ALLOWED_TYPES: NodeEntryType[] = ["boolean", "number", "select", "text", "uuid"];

    constructor(entry: BlueprintEntry) {
        super();

        this.#entry = entry;

        this.lineStyle({ color: 0xffffff, width: 1 });
        this.drawRect(0, 0, this.width, this.height);

        const connected = this.connected;
        const children = [
            (this.#overlay = this.#drawOverlay(connected)),
            (this.#content = this.#drawContent(connected)),
            this.#drawDecoration(connected),
        ];

        this.addChild(...children.filter(R.isTruthy));

        this.eventMode = "static";
        this.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);

        this.on("pointerdown", (event) => event.stopPropagation());
        this.on("pointerup", this.#onPointerUp.bind(this));
    }

    static isFieldEntry<T extends BlueprintEntry>(entry: T): boolean {
        return EntryField.ALLOWED_TYPES.includes(entry.type);
    }

    get entry(): BlueprintEntry {
        return this.#entry;
    }

    get schema(): BaseNodeSchemaEntry {
        return this.entry.schema;
    }

    get node(): BlueprintNode {
        return this.entry.node;
    }

    get blueprint(): Blueprint {
        return this.node.blueprint;
    }

    get type(): NodeEntryType {
        return this.entry.type;
    }

    get key(): string {
        return this.entry.key;
    }

    get width(): number {
        return this.type === "boolean" ? this.height : this.type === "number" ? 30 : 120;
    }

    get height(): number {
        return this.type === "boolean" ? this.node.entryHeight * 0.75 : this.node.entryHeight;
    }

    get overlay(): PIXI.Graphics {
        return this.#overlay;
    }

    get connected(): boolean {
        return this.entry.connected;
    }

    get isBoolean(): boolean {
        return this.type === "boolean";
    }

    get isText(): boolean {
        return this.type === "text";
    }

    get isNumber(): boolean {
        return this.type === "number";
    }

    get isSelect(): boolean {
        return this.type == "select";
    }

    get isUuid(): boolean {
        return this.type === "uuid";
    }

    get isInput(): boolean {
        return this.isText || this.isNumber || this.isUuid;
    }

    get cursor(): "pointer" | "default" | "text" {
        return this.connected ? "default" : this.isInput ? "text" : "pointer";
    }

    get inputFontSize(): number {
        return this.entry.node.fontSize * 0.86;
    }

    get inlinePadding(): number {
        return 4;
    }

    get value(): NonNullable<NodeEntryValue> {
        return this.entry.value as NonNullable<NodeEntryValue>;
    }

    set value(value: NodeEntryValue) {
        if (value === this.value) return;
        this.node.data.setValue(this.entry.id, value);
        this.blueprint.refresh();
    }

    get content(): string {
        const value = String(this.value).trim();
        const schema = this.schema;

        if (entrySchemaIsOfType(schema, "text") && schema.field?.code) {
            return value.replace(/\s{1}|\\n/g, "");
        }

        if (entrySchemaIsOfType(schema, "select")) {
            const options = schema.field.options;
            const option = options.find((option) => option.value === value) ?? options[0];

            return localizeOption(option.label || option.value, this.node.localizePath);
        }

        return value;
    }

    get placeholder(): string {
        return this.isNumber ? "" : this.entry.label;
    }

    get textWidth(): number {
        return this.isSelect ? this.width - 16 : this.width;
    }

    get globalBounds(): PIXI.Rectangle {
        const { x, y } = this.getGlobalPosition();
        const topLeft = this.blueprint.getGlobalCoordinates({ x, y });
        const bottomRight = this.blueprint.getGlobalCoordinates({
            x: x + this.width,
            y: y + this.height,
        });

        const top = topLeft.y - 1;
        const bottom = bottomRight.y + 1;
        const left = topLeft.x - 1;
        const right = bottomRight.x + 1;

        return new PIXI.Rectangle(left, top, right - left, bottom - top);
    }

    onDropDocument(type: string, document: BlueprintDropDocument) {
        if (this.isText) {
            this.value = document.name;
            return;
        }

        const schema = this.schema;
        if (!entrySchemaIsOfType(schema, "uuid")) return;

        if (schema.field.document === type) {
            const isItem = isClientDocument(document) && document instanceof Item;
            this.value = (isItem && document.sourceId) || document.uuid;
        } else {
            warning("document.wrong");
        }
    }

    #drawDecoration(connected = this.connected): PIXI.Graphics | undefined {
        if (!this.isSelect) return;

        const color = 0xffffff;
        const height = this.height;
        const icon = new PIXI.Graphics();

        icon.alpha = connected ? 0.5 : 1;
        icon.x = this.width - 16;

        icon.lineStyle({ color, width: 1 });
        icon.moveTo(0, 0);
        icon.lineTo(0, height);

        const highPoint = height / 3;
        const lowPoint = height * 0.66;

        icon.lineStyle({ color, width: 1 });
        icon.moveTo(4, highPoint);
        icon.lineTo(8, lowPoint);
        icon.lineTo(12, highPoint);

        return icon;
    }

    #drawContent(connected = this.connected): PIXI.Graphics | PreciseText {
        const height = this.height;

        if (this.isBoolean) {
            const check = new PIXI.Graphics();

            if (!connected && this.value) {
                check.beginFill(0x940404, 0.5);
                check.drawRect(1, 1, height - 2, height - 2);
                check.endFill();
            }

            return check;
        }

        const label = connected ? undefined : this.content;
        const padding = this.inlinePadding;

        const text = this.node.preciseText(label || this.placeholder, {
            fontSize: this.inputFontSize,
            fill: 0xffffff,
        }) as PreciseText;

        text.alpha = connected || !label ? 0.5 : 1;
        text.x = padding;
        text.y = (height - text.height) / 2;

        const mask = drawRectangleMask(0, 0, this.textWidth - padding * 2, height);

        text.addChild(mask);
        text.mask = mask;

        return text;
    }

    #drawOverlay(connected = this.connected): PIXI.Graphics {
        const overlay = new PIXI.Graphics();

        overlay.beginFill(0x3b3b3b, 1);
        overlay.drawRect(1, 1, this.width - 2, this.height - 2);
        overlay.endFill();

        overlay.alpha = Number(connected);
        overlay.eventMode = connected ? "static" : "none";

        return overlay;
    }

    #onPointerUp(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();
        if (this.connected) return;

        this.#updateValue(event).then((value) => {
            this.value = value;
        });
    }

    async #updateValue(event: PIXI.FederatedPointerEvent): Promise<NodeEntryValue> {
        const current = this.value;
        const schema = this.schema;

        if (this.isBoolean) {
            return !current;
        }

        if (entrySchemaIsOfType(schema, "select")) {
            const entries = schema.field.options.map(({ label, value }) => {
                return {
                    label: localizeOption(label || value, this.node.localizePath),
                    data: { value, selected: value === current },
                };
            });

            const result = await BlueprintMenu.wait<{ value: string }>({
                blueprint: this.blueprint,
                target: this,
                groups: [{ title: "", entries }],
                classes: ["input-select"],
            });

            return result?.value ?? current;
        }

        if (entrySchemaIsOfType(schema, "number")) {
            const input = foundry.applications.fields.createNumberInput({
                name: "field",
                value: current as number,
                min: schema.field?.min ?? undefined,
                max: schema.field?.max ?? undefined,
                step: schema.field?.step ?? 1,
                classes: "trigger-input",
            });

            return this.#addInput(input);
        }

        if (entrySchemaIsOfType(schema, "text")) {
            if (schema.field?.code) {
                return this.#createCodeDialog(current as string);
            }

            const input = foundry.applications.fields.createTextInput({
                name: "field",
                value: current as string,
                placeholder: this.placeholder,
                classes: "trigger-input",
            });

            return this.#addInput(input);
        }

        if (entrySchemaIsOfType(schema, "uuid")) {
            const input = foundry.applications.fields.createTextInput({
                name: "field",
                value: current as string,
                placeholder: this.placeholder,
                classes: "trigger-input",
            });

            return this.#addInput(input);
        }

        return current;
    }

    async #createCodeDialog(value: string): Promise<NodeEntryValue> {
        return new Promise((resolve) => {
            const input = foundry.applications.elements.HTMLCodeMirrorElement.create({
                name: "field",
                value: value,
                autofocus: true,
                language: "json",
                classes: "trigger-input",
            });

            document.body.appendChild(input);

            const content = input.querySelector<HTMLElement>(".cm-content");
            content?.focus();

            const { center } = this.globalBounds;
            const bounds = input.getBoundingClientRect();
            const viewBounds = this.blueprint.getBoundClientRect();
            const position: Point = {
                x: center.x - bounds.width / 2,
                y: center.y - bounds.height / 2,
            };

            if (position.y + bounds.height > viewBounds.bottom) {
                position.y = viewBounds.bottom - bounds.height;
            }

            if (position.y < viewBounds.top) {
                position.y = viewBounds.top;
            }

            if (position.x + bounds.width > viewBounds.right) {
                position.x = viewBounds.right - bounds.width;
            }

            if (position.x < viewBounds.left) {
                position.x = viewBounds.left;
            }

            assignStyle(input, {
                left: `${position.x}px`,
                top: `${position.y}px`,
            });

            const onBlur = () => {
                // we wait one frame so the code-mirror #onBlur can happen before
                requestAnimationFrame(() => {
                    resolve(input.value);
                    input.remove();
                });
            };

            content?.addEventListener("blur", onBlur, { once: true });

            input.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();

                    content?.removeEventListener("blur", onBlur);

                    input.remove();
                }
            });
        });
    }

    async #addInput(input: HTMLInputElement): Promise<NodeEntryValue> {
        return new Promise((resolve) => {
            const { left, top, width, height } = this.globalBounds;

            document.body.appendChild(input);

            input.focus();
            input.select();

            assignStyle(input, {
                width: `${width}px`,
                height: `${height}px`,
                left: `${left}px`,
                top: `${top}px`,
                fontSize: `${this.inputFontSize}px`,
                paddingInline: `${this.#content.x}px`,
                paddingBlock: `0px`,
            });

            const onBlur = () => {
                const value = input.type === "number" ? input.valueAsNumber : input.value;
                resolve(value);
                input.remove();
            };

            input.addEventListener("blur", onBlur, { once: true });

            input.addEventListener("keydown", (event) => {
                const key = event.key;
                if (!R.isIncludedIn(key, ["Enter", "Escape"] as const)) return;

                event.preventDefault();
                event.stopPropagation();

                if (key === "Enter") {
                    input.blur();
                } else {
                    input.removeEventListener("blur", onBlur);
                    input.remove();
                }
            });
        });
    }
}

function localizeOption(value: string, localizePath: string): string {
    return (
        localizeIfExist(localizePath, "option", value) ??
        localizeIfExist("select-option", value) ??
        game.i18n.localize(value)
    );
}

export { EntryField };
