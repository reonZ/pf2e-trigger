import { BlueprintTextEntry } from "./blueprint-entry-text";

class BlueprintUuidEntry extends BlueprintTextEntry {
    protected _onDocumentDropped(document: ClientDocument | CompendiumIndexData) {
        this.value = document.uuid;
    }
}

export { BlueprintUuidEntry };
