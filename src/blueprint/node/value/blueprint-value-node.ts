import { BlueprintNode } from "../blueprint-node";

class ValueBlueprintNode extends BlueprintNode {
    get subtitle(): null {
        return null;
    }

    get headerColor(): number {
        return 0x757575;
    }
}

export { ValueBlueprintNode };
