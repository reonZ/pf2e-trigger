import {
    ExtractInputSchemaEntry,
    ExtractSchemaEntryType,
    NodeEntryCategory,
    NodeEntryType,
    NodeType,
    NonNullableNodeEntryType,
    getDefaultInputValue,
    isInputConnection,
    setToSchemaValue,
} from "schema/schema";
import { BlueprintEntry } from "../blueprint-entry";

abstract class BlueprintValueEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory,
    TEntry extends NonNullableNodeEntryType = NonNullableNodeEntryType
> extends BlueprintEntry<TCategory> {
    protected abstract _onInputFocus(target: PIXI.Graphics): Promise<void>;

    get isField(): boolean {
        return this.category === "inputs" && !isInputConnection(this.schema);
    }

    get canConnect(): boolean {
        return !this.isField && (this.category === "outputs" || this.connections.length === 0);
    }

    get isActive(): boolean {
        return !this.isField && this.connections.length > 0;
    }

    get isValue(): boolean {
        return true;
    }

    get value(): ExtractSchemaEntryType<TEntry> {
        return (this.node.getValue(this.category, this.key) ??
            getDefaultInputValue(this.schema)) as ExtractSchemaEntryType<TEntry>;
    }

    set value(value: ExtractSchemaEntryType<TEntry>) {
        const processed = setToSchemaValue(this.schema, value);
        this.node.setValue(this.category, this.key, processed);
        if (this.node) {
            this.refreshField();
        }
    }

    get inputFontSize(): number {
        return this.node.fontSize * 0.86;
    }

    get fieldComponent(): PIXI.Graphics | undefined {
        return (
            this.textComponent.name === "field"
                ? this.textComponent
                : this.textComponent.children.find((child) => child.name === "field")
        ) as PIXI.Graphics | undefined;
    }

    canConnectoToBridge(target: NodeType): boolean {
        return false;
    }

    refreshField() {
        const field = this.fieldComponent?.children[0];

        if (field instanceof PreciseText) {
            const text = String(this.value);
            const placeholder = text.length === 0 ? this.label : undefined;

            field.text = placeholder ?? text;
            field.style.fill = placeholder ? "#ffffff80" : "#ffffff";
        }
    }

    initialize(): void {
        super.initialize();

        const field = this.fieldComponent;
        if (field) {
            field.on(
                "pointerup",
                (event: PIXI.FederatedPointerEvent) => {
                    event.stopPropagation();
                    this._onInputFocus(field);
                },
                this
            );
        }
    }

    onDropDocument({ x, y }: Point, document: ClientDocument | CompendiumIndexData): boolean {
        if (!this.isField || !this.textComponent.getBounds().contains(x, y)) return false;
        this._onDocumentDropped(document);
        return true;
    }

    protected _onDocumentDropped(document: ClientDocument | CompendiumIndexData) {
        return;
    }

    protected _fillConnector(connector: PIXI.Graphics) {
        connector.lineStyle({ color: this.connectorColor, width: 2 });
        connector.drawCircle(5, 6, 6);
    }

    protected _createConnector(): PIXI.Graphics | null {
        return this.isField ? null : super._createConnector();
    }

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
}

interface BlueprintValueEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory,
    TEntry extends NonNullableNodeEntryType = NonNullableNodeEntryType
> extends BlueprintEntry<TCategory> {
    get type(): NonNullable<NodeEntryType>;
    get schema(): ExtractInputSchemaEntry<TEntry>;
}

export { BlueprintValueEntry };
