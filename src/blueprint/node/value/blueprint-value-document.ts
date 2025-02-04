import { R } from "module-helpers";
import { ValueBlueprintNode } from "./blueprint-value-node";

abstract class DocumentBlueprintNode<TDocument extends ClientDocument> extends ValueBlueprintNode {
    protected abstract _isValidDocument(document: TDocument): boolean;
    protected abstract _isValidCompendiumIndex(document: CompendiumIndexData): boolean;

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
        const uuid = this.data.inputs.uuid?.value;
        if (!R.isString(uuid) || !uuid.trim()) return;

        const document = fromUuidSync<TDocument | CompendiumIndexData>(uuid);
        const isValid =
            document instanceof foundry.abstract.Document
                ? this._isValidDocument(document)
                : R.isPlainObject(document)
                ? this._isValidCompendiumIndex(document)
                : false;

        return isValid ? document : null;
    }

    _onValueUpdate(key: string): boolean {
        if (key === "uuid") {
            this.refresh();
        }
        return true;
    }
}

export { DocumentBlueprintNode };
