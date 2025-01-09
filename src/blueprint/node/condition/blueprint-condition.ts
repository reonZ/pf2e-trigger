import { ConditionTriggerNode } from "@node/condition/condition";
import { BlueprintNode } from "../blueprint-node";

abstract class ConditionBlueprintNode extends BlueprintNode {
    get headerColor(): number {
        return 0x188600;
    }
}

interface ConditionBlueprintNode extends BlueprintNode {
    get trigger(): ConditionTriggerNode;
}

export { ConditionBlueprintNode };
