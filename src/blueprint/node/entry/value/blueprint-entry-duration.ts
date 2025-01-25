import { NodeEntryCategory } from "schema/schema";
import { BlueprintValueEntry } from "./blueprint-entry-value";

class BlueprintDurationEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory> {
    get connectorColor(): number {
        return 0x75db32;
    }

    protected async _onInputFocus(target: PIXI.Graphics) {}
}

export { BlueprintDurationEntry };
