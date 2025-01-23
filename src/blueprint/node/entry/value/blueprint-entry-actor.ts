import { NodeEntryCategory } from "schema/schema";
import { BlueprintValueEntry } from "./blueprint-entry-value";

class BlueprintActorEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory> {
    get connectorColor(): number {
        return 0xad1a4b;
    }

    protected async _onInputFocus(target: PIXI.Graphics) {}
}

export { BlueprintActorEntry };
