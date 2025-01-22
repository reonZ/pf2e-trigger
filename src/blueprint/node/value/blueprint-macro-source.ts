import { MacroPF2e } from "module-helpers";
import { DocumentSourceBlueprintNode } from "./blueprint-document-source";

class MacroSourceBlueprintNode extends DocumentSourceBlueprintNode<MacroPF2e> {
    protected _isValidDocument(
        macro: Maybe<MacroPF2e | CompendiumIndexData>,
        value: string
    ): macro is MacroPF2e | CompendiumIndexData {
        return macro instanceof foundry.abstract.Document ? macro.type === "script" : !!macro;
    }
}

export { MacroSourceBlueprintNode };
