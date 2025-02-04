import { ItemPF2e, isItemEntry } from "module-helpers";
import { DocumentBlueprintNode } from "./blueprint-value-document";

class ItemSourceBlueprintNode extends DocumentBlueprintNode<ItemPF2e> {
    protected _isValidDocument(document: ItemPF2e): boolean {
        return isItemEntry(document);
    }

    protected _isValidCompendiumIndex(document: CompendiumIndexData): boolean {
        return isItemEntry(document);
    }
}

export { ItemSourceBlueprintNode };
