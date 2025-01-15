import { NodeEntryCategory } from "@schema/schema";
import { ItemPF2e } from "module-helpers";
import { BlueprintValueEntry } from "./blueprint-entry-value";

class BlueprintTextEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory, "text"> {
    protected _createText(): PreciseText | PIXI.Graphics {
        return this._createInputField(120, String(this.value));
    }

    protected _onItemDropped(item: ItemPF2e | CompendiumIndexData) {
        this.value = item.name;
    }
}

export { BlueprintTextEntry };
