import { NodeEntryCategory, NodeSchemaBooleanEntry } from "@schema/schema";
import { BlueprintValueEntry } from "./blueprint-entry-value";

class BlueprintBooleanEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory, NodeSchemaBooleanEntry> {
    get connectorColor(): number {
        return 0x940404;
    }

    // protected _createText(): PIXI.Container {
    //     const textEl = super._createText();
    //     if (!this.isField) return textEl;
    //     const wrapper = new PIXI.Container();
    //     wrapper.addChild(textEl);
    //     const value = String(this.value ?? 15);
    //     const field = this._createInputField(40, value);
    //     field.x = textEl.x + textEl.width + this.spacing;
    //     wrapper.addChild(field);
    //     return wrapper;
    // }
}

export { BlueprintBooleanEntry };
