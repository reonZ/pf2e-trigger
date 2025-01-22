import { NodeEntryValue } from "data/data-node";
import { NodeEntryCategory } from "schema/schema";
import { ValueBlueprintNode } from "./blueprint-value-node";
import { R } from "module-helpers";

abstract class DocumentSourceBlueprintNode<
    TDocument extends ClientDocument
> extends ValueBlueprintNode {
    #document: Maybe<TDocument | CompendiumIndexData>;

    protected abstract _isValidDocument(
        document: Maybe<TDocument | CompendiumIndexData>,
        value: string
    ): document is TDocument | CompendiumIndexData;

    get title(): string | null {
        return this.document?.name || super.title;
    }

    get icon(): string | PIXI.Sprite | null {
        const document = this.document;
        return document === null
            ? "\uf127"
            : document && "img" in document
            ? PIXI.Sprite.from(document.img)
            : super.icon;
    }

    get document(): Maybe<TDocument | CompendiumIndexData> {
        return this.#document;
    }

    initialize(): void {
        this.#document = this.#getDocument();
        super.initialize();
    }

    setValue(category: NodeEntryCategory, key: string, value: NodeEntryValue) {
        super.setValue(category, key, value);
        this.refresh();
    }

    #getDocument(): Maybe<TDocument | CompendiumIndexData> {
        const value = this.getValue("inputs", "uuid");
        if (!R.isString(value) || !value.trim()) return;

        const document = fromUuidSync<TDocument | CompendiumIndexData>(value);
        return this._isValidDocument(document, value) ? document : null;
    }
}

export { DocumentSourceBlueprintNode };
