import { ItemPF2e, isItemEntry } from "module-helpers";
import { DocumentSourceBlueprintNode } from "./blueprint-document-source";

class ItemSourceBlueprintNode extends DocumentSourceBlueprintNode<ItemPF2e> {
    protected _isValidDocument(
        item: Maybe<ItemPF2e | CompendiumIndexData>,
        value: string
    ): item is ItemPF2e | CompendiumIndexData {
        return isItemEntry(item);
    }
}

export { ItemSourceBlueprintNode };
