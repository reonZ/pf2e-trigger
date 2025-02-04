import { BlueprintInputFieldEntry } from "./blueprint-entry-input-field";

class BlueprintTextEntry extends BlueprintInputFieldEntry<"text"> {
    protected _createLabel(): PIXI.Container {
        return this._createInputField(120, this.value);
    }

    protected _onDocumentDropped(document: ClientDocument | CompendiumIndexData) {
        this.value = document.name ?? "";
    }

    protected _createHtmlInput(): HTMLInputElement {
        const value = this.value;
        const el = document.createElement("input");

        el.type = "text";
        el.value = String(value);
        el.autocomplete = "off";
        el.spellcheck = false;

        return el;
    }
}

export { BlueprintTextEntry };
