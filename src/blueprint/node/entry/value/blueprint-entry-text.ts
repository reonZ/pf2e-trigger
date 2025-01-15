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
        const textEl = super._createText();
        if (!this.isField) return textEl;

        return this._createInputField(120, String(this.value));
    }

    protected _onItemDropped(item: ItemPF2e | CompendiumIndexData) {
        this.value = item.name;
    }
}

export { BlueprintTextEntry };
