import { NodeEntryCategory } from "schema/schema";
import { BlueprintInputEntry } from "./blueprint-entry-input";

class BlueprintBooleanEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintInputEntry<TCategory, "boolean"> {
    get connectorColor(): number {
        return 0x940404;
    }

    get checkboxHeight(): number {
        return 14;
    }

    refreshField() {
        const field = this.fieldComponent;
        if (!field) return;

        this.#drawField(field);
    }

    protected async _onInputFocus(target: PIXI.Graphics) {
        this.value = !this.value;
    }

    protected _createText(): PIXI.Container {
        if (!this.isField) {
            return super._createText();
        }

        const wrapper = new PIXI.Container();

        const textEl = wrapper.addChild(super._createText());
        const height = this.checkboxHeight;

        const field = new PIXI.Graphics();
        field.x = textEl.x + textEl.width + this.spacing;

        field.name = "field";
        field.eventMode = "static";
        field.cursor = "pointer";
        field.hitArea = new PIXI.Rectangle(0, 0, height, height);
        field.on("pointerdown", (event) => event.stopPropagation());

        this.#drawField(field);

        wrapper.addChild(field);

        return wrapper;
    }

    #drawField(field: PIXI.Graphics) {
        const height = this.checkboxHeight;
        const active = this.value === true;

        field.clear();
        field.lineStyle({ color: 0xffffff, width: 1 });
        if (active) field.beginFill(0x808080);
        field.drawRect(0, 1, height, height);
        if (active) field.endFill();
    }
}

export { BlueprintBooleanEntry };
