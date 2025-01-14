import { NodeEntryValue } from "@data/data-node";
import {
    NodeEntryCategory,
    NodeEntryType,
    NodeType,
    NonNullableInputEntry,
    getDefaultInputValue,
    isInputConnection,
    setToSchemaValue,
} from "@schema/schema";
import { ItemPF2e, R } from "module-helpers";
import { BlueprintEntry } from "../blueprint-entry";

abstract class BlueprintValueEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory,
    TSchema extends NonNullableInputEntry = NonNullableInputEntry
> extends BlueprintEntry<TCategory> {
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

    get value(): NonNullable<NodeEntryValue> {
        return this.node.getValue(this.category, this.key) ?? getDefaultInputValue(this.schema);
    }

    set value(value: unknown) {
        const processed = setToSchemaValue(this.schema, value);
        this.node.setValue(this.category, this.key, processed);
        this._onValueChange(processed);
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
        const fieldText = this.fieldComponent?.children[0];

        if (fieldText instanceof PreciseText) {
            fieldText.text = String(this.value);
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

    onDropItem({ x, y }: Point, item: ItemPF2e | CompendiumIndexData): boolean {
        if (!this.isField || !this.textComponent.getBounds().contains(x, y)) return false;
        this._onItemDropped(item);
        return true;
    }

    protected _onValueChange(value: NodeEntryValue) {
        this.refreshField();
    }

    protected _onItemDropped(item: ItemPF2e | CompendiumIndexData) {
        return;
    }

    protected _fillConnector(connector: PIXI.Graphics) {
        connector.lineStyle({ color: this.connectorColor, width: 2 });
        connector.drawCircle(5, 6, 6);
    }

    protected _createConnector(): PIXI.Graphics | null {
        return this.isField ? null : super._createConnector();
    }

    protected _createInputField(width: number, text: string, faded?: boolean) {
        const padding = 4;
        const textEl = this.node.preciseText(text, {
            fill: faded ? "#ffffff80" : "#ffffff",
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

    protected async _onInputFocus(target: PIXI.Graphics): Promise<void> {
        const value = this.value;
        const bounds = target.getBounds();
        const viewBounds = this.blueprint.view.getBoundingClientRect();

        target.children[0].visible = false;

        const el = document.createElement("input");
        el.type = "text";
        el.value = R.isString(value) ? value : "";

        Object.assign(el.style, {
            position: "absolute",
            width: `${bounds.width}px`,
            height: `${bounds.height}px`,
            left: `${bounds.x + viewBounds.x}px`,
            top: `${bounds.y + viewBounds.y}px`,
            fontSize: `${this.inputFontSize}px`,
            borderColor: "transparent",
            zIndex: "2147483647",
            color: "white",
        } satisfies Partial<CSSStyleDeclaration>);

        document.body.appendChild(el);

        el.focus();
        el.setSelectionRange(0, -1);

        const onBlur = () => {
            this.value = el.value.trim();
            target.children[0].visible = true;
            el.remove();
        };

        el.addEventListener("blur", onBlur);

        el.addEventListener("keydown", (event) => {
            if (!["Enter", "Escape"].includes(event.key)) return;

            event.preventDefault();
            event.stopPropagation();

            switch (event.key) {
                case "Enter": {
                    el.blur();
                    break;
                }

                case "Escape": {
                    el.removeEventListener("blur", onBlur);
                    el.remove();
                    target.children[0].visible = true;
                    break;
                }
            }
        });
    }
}

interface BlueprintValueEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory,
    TSchema extends NonNullableInputEntry = NonNullableInputEntry
> extends BlueprintEntry<TCategory> {
    get type(): NonNullable<NodeEntryType>;
    get schema(): TSchema;
}

export { BlueprintValueEntry };
