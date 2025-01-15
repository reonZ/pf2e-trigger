import { NodeEntryCategory } from "@schema/schema";
import { R } from "module-helpers";
import { BlueprintInputEntry } from "./blueprint-entry-input";

class BlueprintNumberEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintInputEntry<TCategory, "number"> {
    get connectorColor(): number {
        return 0x07b88f;
    }

    protected _createText(): PIXI.Container {
        if (!this.isField) {
            return super._createText();
        }

        const wrapper = new PIXI.Container();
        const field = this._createInputField(40, String(this.value));

        if (this.node.type !== "value") {
            const textEl = wrapper.addChild(super._createText());
            field.x = textEl.x + textEl.width + this.spacing;
        }

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
