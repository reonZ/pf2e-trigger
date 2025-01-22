import { NodeEntryCategory } from "schema/schema";
import { BlueprintValueEntry } from "./blueprint-entry-value";

class BlueprintMacroEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory> {
    get connectorColor(): number {
        return 0xa1733f;
    }

    protected async _onInputFocus(target: PIXI.Graphics) {}
}

export { BlueprintMacroEntry };
