import { NodeEntryCategory, NodeSchemaNumberEntry } from "@schema/schema";
import { BlueprintValueEntry } from "./blueprint-entry-value";

class BlueprintNumberEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory, NodeSchemaNumberEntry> {
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
}

export { BlueprintNumberEntry };
