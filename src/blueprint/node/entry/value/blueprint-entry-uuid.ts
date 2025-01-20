import { NodeEntryCategory } from "@schema/schema";
import { ItemPF2e } from "module-helpers";
import { BlueprintInputEntry } from "./blueprint-entry-input";

class BlueprintUuidEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintInputEntry<TCategory, "uuid"> {
    protected _createText(): PreciseText | PIXI.Graphics {
        return this._createInputField(120, this.value);
    }

    protected _onItemDropped(item: ItemPF2e | CompendiumIndexData) {
        this.value = item.uuid;
    }
}

export { BlueprintUuidEntry };
