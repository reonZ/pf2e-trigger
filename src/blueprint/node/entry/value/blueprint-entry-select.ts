import { BlueprintSelectMenu } from "blueprint/menu/blueprint-select-menu";
import { NodeEntryCategory, NodeSchemaSelectOption, getSelectOption } from "schema/schema";
import { R, localize, localizeIfExist } from "module-helpers";
import { BlueprintValueEntry } from "./blueprint-entry-value";

class BlueprintSelectEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory, "select"> {
    get options(): NodeSchemaSelectOption[] {
        return this.schema.field.options.map((option) => {
            return R.isPlainObject(option)
                ? { value: option.value, label: this.processOptionLabel(option) }
                : { value: option, label: localize("select", option) };
        });
    }

    get labeledValue(): string {
        const value = this.value;
        const schema = this.schema;
        const option = getSelectOption(schema.field, value);

        return R.isPlainObject(option)
            ? this.processOptionLabel(option)
            : localizeIfExist("select", value) ?? value;
    }

    refreshField() {
        const wrapper = this.fieldComponent?.children[0] as PIXI.Container | undefined;
        const fieldText = wrapper?.children[0];

        if (fieldText instanceof PreciseText) {
            fieldText.text = this.labeledValue;
        }
    }

    processOptionLabel(option: NodeSchemaSelectOption) {
        return (
            localizeIfExist(this.node.localizePath, this.key, "option", option.label) ??
            game.i18n.localize(option.label)
        );
    }

    protected _createText(): PIXI.Container {
        const wrapper = new PIXI.Container();
        wrapper.name = "field";
        wrapper.cursor = "pointer";
        wrapper.eventMode = "static";

        const field = this._createInputField(104, this.labeledValue);
        field.name = null;
        field.eventMode = "auto";

        const icon = new PIXI.Graphics();
        icon.x = field.x + field.width - 1;
        icon.hitArea = new PIXI.Rectangle(0, 0, 16, 16);
        icon.eventMode = "auto";

        const height = field.height - 1;

        icon.lineStyle({ color: 0xffffff, width: 1 });
        icon.moveTo(0, 0);
        icon.lineTo(16, 0);
        icon.lineTo(16, height);
        icon.lineTo(0, height);

        const highPoint = height / 3;
        const lowPoint = height * 0.66;

        icon.lineStyle({ color: 0xffffff, width: 1 });
        icon.moveTo(4, highPoint);
        icon.lineTo(8, lowPoint);
        icon.lineTo(12, highPoint);

        wrapper.addChild(field);
        wrapper.addChild(icon);

        wrapper.on("pointerdown", (event) => event.stopPropagation());

        return wrapper;
    }

    protected async _onInputFocus(target: PIXI.Graphics) {
        const context = await BlueprintSelectMenu.open(this.blueprint, target, this.options, {
            classes: ["input-select"],
            style: {
                fontSize: `${this.inputFontSize}px`,
                borderColor: `rgb(255 255 255 / ${this.node.opacity})`,
                background: `rgb(0 0 0 / ${this.node.opacity})`,
            },
        });

        if (!context) return;

        this.value = context;
    }
}

export { BlueprintSelectEntry };
