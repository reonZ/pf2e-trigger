import { NodeEntryCategory } from "schema/schema";
import { BlueprintInputEntry } from "./blueprint-entry-input";

class BlueprintUuidEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintInputEntry<TCategory, "uuid"> {
    protected _createText(): PreciseText | PIXI.Graphics {
        return this._createInputField(120, this.value);
    }

    protected _onDocumentDropped(document: ClientDocument | CompendiumIndexData) {
        this.value = document.uuid;
    }
}

export { BlueprintUuidEntry };
