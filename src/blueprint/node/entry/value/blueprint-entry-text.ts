import { NodeEntryCategory } from "schema/schema";
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

        return this._createInputField(120, this.value);
    }

    protected _onDocumentDropped(document: ClientDocument | CompendiumIndexData) {
        this.value = document.name ?? "";
    }
}

export { BlueprintTextEntry };
