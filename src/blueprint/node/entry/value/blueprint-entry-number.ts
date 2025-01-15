import { NodeEntryCategory } from "@schema/schema";
import { BlueprintValueEntry } from "./blueprint-entry-value";
import { R } from "module-helpers";

class BlueprintNumberEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory, "number"> {
    get connectorColor(): number {
        return 0x07b88f;
    }

    protected _createText(): PIXI.Container {
        const textEl = super._createText();
        if (!this.isField) return textEl;

        const wrapper = new PIXI.Container();
        wrapper.addChild(textEl);

        const value = String(this.value);

        const field = this._createInputField(40, value);
        field.x = textEl.x + textEl.width + this.spacing;

        wrapper.addChild(field);

        return wrapper;
    }

    protected _createHtmlInput(): HTMLInputElement {
        const schema = this.schema;
        const el = document.createElement("input");

        el.type = "number";
        el.value = String(this.value);

        if (R.isPlainObject(schema.field)) {
            el.min = String(schema.field.min ?? "");
            el.max = String(schema.field.max ?? "");
            el.step = String(schema.field.step ?? "1");
        }

        return el;
    }
}

export { BlueprintNumberEntry };
