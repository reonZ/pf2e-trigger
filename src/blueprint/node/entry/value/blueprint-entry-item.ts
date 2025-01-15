import { NodeEntryCategory } from "@schema/schema";
import { BlueprintValueEntry } from "./blueprint-entry-value";

class BlueprintItemEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory> {
    get connectorColor(): number {
        return 0x696fe0;
    }
}

export { BlueprintItemEntry };
