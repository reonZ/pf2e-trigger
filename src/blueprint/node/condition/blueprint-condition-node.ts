import { BlueprintNode } from "../blueprint-node";

abstract class ConditionBlueprintNode extends BlueprintNode {
    get headerColor(): number {
        return 0x188600;
    }
}

export { ConditionBlueprintNode };
