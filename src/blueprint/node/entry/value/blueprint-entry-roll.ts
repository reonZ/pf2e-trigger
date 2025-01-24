import { NodeEntryCategory } from "schema/schema";
import { BlueprintValueEntry } from "./blueprint-entry-value";

class BlueprintRollEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory> {
    get connectorColor(): number {
        return 0xd6d61e;
    }

    protected async _onInputFocus(target: PIXI.Graphics) {}
}

export { BlueprintRollEntry };
