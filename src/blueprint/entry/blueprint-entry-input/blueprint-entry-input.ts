import { getDefaultInputValue, isNonNullNodeEntryType, setToSchemaValue } from "data/data-entry";
import { inputHasConnector } from "schema/schema-list";
import { BlueprintValueEntry } from "../blueprint-entry-value";

abstract class BlueprintInputEntry<
    TEntry extends NonNullNodeEntryType = NonNullNodeEntryType
> extends BlueprintValueEntry<"inputs"> {
    #cover: PIXI.Graphics | null = null;

    protected abstract _onInputFocus(): void;

    get isField(): boolean {
        return !this.isActive && isNonNullNodeEntryType(this.type);
    }

    get fieldComponent(): PIXI.Graphics {
        return (
            this.labelComponent.name === "field"
                ? this.labelComponent
                : this.labelComponent.children.find((child) => child.name === "field")
        ) as PIXI.Graphics;
    }

    get inputFontSize(): number {
        return this.node.fontSize * 0.86;
    }

    get value(): ExtractEntryType<TEntry> {
        return (this.node.data.inputs[this.key]?.value ??
            getDefaultInputValue(this.schema)) as ExtractEntryType<TEntry>;
    }

    set value(value: ExtractEntryType<TEntry>) {
        const processed = setToSchemaValue(this.schema, value);

        fu.setProperty(this.node.data.inputs, `${this.key}.value`, processed);

        if (this.node?._onValueUpdate(this.key)) {
            this.refreshFieldText();
        }
    }

    get hasConnector(): boolean {
        return inputHasConnector(this.schema, this.node.type);
    }

    initialize(): void {
        super.initialize();

        this.fieldComponent.on(
            "pointerup",
            (event: PIXI.FederatedPointerEvent) => {
                event.stopPropagation();
                this._onInputFocus();
            },
            this
        );

        this.#drawFieldCover();
    }

    refreshConnector() {
        super.refreshConnector();

        if (this.isActive && !this.#cover) {
            // @ts-expect-error
            this.value = undefined;
        }

        this.#drawFieldCover();
    }

    refreshFieldText() {
        const field = this.fieldComponent?.children[0];

        if (field instanceof PreciseText) {
            const text = String(this.value);
            const placeholder = text.length === 0 ? this.label : undefined;

            field.text = placeholder ?? text;
            field.style.fill = placeholder ? "#ffffff80" : "#ffffff";
        }
    }

    onDropDocument({ x, y }: Point, document: ClientDocument | CompendiumIndexData): boolean {
        if (!this.isField || !this.getBounds().contains(x, y)) return false;
        this._onDocumentDropped?.(document);
        return true;
    }

    protected _onDocumentDropped(document: ClientDocument | CompendiumIndexData) {}

    protected _createInputField(width: number, value: string | number) {
        const padding = 4;
        const text = String(value);
        const placeholder = text.length === 0 ? this.label : undefined;
        const textEl = this.node.preciseText(placeholder ?? text, {
            fill: placeholder ? "#ffffff80" : "#ffffff",
            fontSize: this.inputFontSize,
        });

        textEl.x = padding;
        textEl.y = 1;

        const height = textEl.height + 3;

        const field = new PIXI.Graphics();
        field.cursor = "text";

        field.lineStyle({ color: 0xffffff, width: 1 });
        field.drawRect(0, 0, width, height);

        field.name = "field";
        field.eventMode = "static";
        field.hitArea = new PIXI.Rectangle(0, 0, width, height);
        field.on("pointerdown", (event) => event.stopPropagation());

        const textMask = new PIXI.Graphics();
        textMask.beginFill(0x555555);
        textMask.drawRect(0, 0, width - padding * 2, textEl.height);
        textMask.endFill();

        textEl.addChild(textMask);
        textEl.mask = textMask;

        field.addChild(textEl);

        return field;
    }

    #drawFieldCover() {
        const field = this.fieldComponent;

        if (this.isActive) {
            this.#cover = field.addChild(new PIXI.Graphics());
            this.#cover.lineStyle({ color: 0xffffff, width: 1, alpha: 0.5 });
            this.#cover.beginFill(0x3b3b3b, 1);
            this.#cover.drawRect(0, 0, field.width, field.height);
            this.#cover.endFill();

            field.interactive = false;
        } else if (this.#cover) {
            field.removeChild(this.#cover);

            this.#cover.destroy();
            this.#cover = null;

            field.interactive = true;
        }
    }
}

interface BlueprintInputEntry<TEntry extends NonNullNodeEntryType = NonNullNodeEntryType>
    extends BlueprintValueEntry<"inputs"> {
    get schema(): NonNullNodeEntry<NodeSchemaInput>;
}

export { BlueprintInputEntry };
