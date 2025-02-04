import { R } from "module-helpers";
import { BlueprintInputFieldEntry } from "./blueprint-entry-input-field";

class BlueprintNumberEntry extends BlueprintInputFieldEntry<"number"> {
    protected _createLabel(): PIXI.Container {
        const wrapper = new PIXI.Container();
        const field = this._createInputField(30, this.value);

        if (this.node.type !== "logic" && this.node.key !== "number-value") {
            const textEl = wrapper.addChild(super._createLabel());
            this.verticalAlign(textEl);

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

interface BlueprintNumberEntry extends BlueprintInputFieldEntry<"number"> {
    get schema(): NodeSchemaNumber;
}

export { BlueprintNumberEntry };
