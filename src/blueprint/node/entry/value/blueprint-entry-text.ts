import { NodeEntryCategory } from "@schema/schema";
import { ItemPF2e } from "module-helpers";
import { BlueprintInputEntry } from "./blueprint-entry-input";

class BlueprintTextEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintInputEntry<TCategory, "text"> {
    get connectorColor(): number {
        return 0xf79442;
    }

    protected _createText(): PIXI.Container {
        if (!this.isField) {
            return super._createText();
        }

        const value = this.value;
        const label = value.length ? value : this.label;

        return this._createInputField(120, label, !value.length);
    }

    protected _onItemDropped(item: ItemPF2e | CompendiumIndexData) {
        this.value = item.name;
    }
}

export { BlueprintTextEntry };
