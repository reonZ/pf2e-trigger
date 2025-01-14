import { NodeEntryCategory, NodeSchemaTextEntry } from "@schema/schema";
import { BlueprintValueEntry } from "./blueprint-entry-value";
import { ItemPF2e } from "module-helpers";

class BlueprintTextEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory, NodeSchemaTextEntry> {
    protected _createText(): PreciseText | PIXI.Graphics {
        return this._createInputField(120, String(this.value));
    }

    protected _onItemDropped(item: ItemPF2e | CompendiumIndexData) {
        this.value = item.name;
    }
}

export { BlueprintTextEntry };
