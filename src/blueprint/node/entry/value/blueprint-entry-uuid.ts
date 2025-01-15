import { NodeEntryValue } from "@data/data-node";
import { NodeEntryCategory } from "@schema/schema";
import { ItemPF2e } from "module-helpers";
import { BlueprintValueEntry } from "./blueprint-entry-value";

class BlueprintUuidEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory, "uuid"> {
    protected _onValueChange(value: NodeEntryValue): void {
        this.node.refresh();
    }

    protected _createText(): PreciseText | PIXI.Graphics {
        const value = this.value;
        const label = value ? String(value) : this.label;

        return this._createInputField(120, label, !value);
    }

    protected _onItemDropped(item: ItemPF2e | CompendiumIndexData) {
        this.value = item.uuid;
    }
}

export { BlueprintUuidEntry };
