import { NodeEntryCategory } from "@schema/schema";
import { BlueprintValueEntry } from "./blueprint-entry-value";

class BlueprintBooleanEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory, "boolean"> {
    get connectorColor(): number {
        return 0x940404;
    }

    protected async _onInputFocus(target: PIXI.Graphics) {}
}

export { BlueprintBooleanEntry };
