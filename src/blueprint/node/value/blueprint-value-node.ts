import { NodeEntryCategory } from "schema/schema";
import { BlueprintNode } from "../blueprint-node";
import { NodeEntryValue } from "data/data-node";

class ValueBlueprintNode extends BlueprintNode {
    get subtitle(): null {
        return null;
    }

    get headerColor(): number {
        return 0x757575;
    }

    setValue(category: NodeEntryCategory, key: string, value: NodeEntryValue) {
        super.setValue(category, key, value);
        this.refresh();
    }
}

export { ValueBlueprintNode };
