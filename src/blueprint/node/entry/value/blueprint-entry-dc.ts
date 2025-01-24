import { NodeEntryCategory } from "schema/schema";
import { BlueprintValueEntry } from "./blueprint-entry-value";

class BlueprintDcEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory> {
    get connectorColor(): number {
        return 0x1682c9;
    }

    protected async _onInputFocus(target: PIXI.Graphics) {}
}

export { BlueprintDcEntry };
