import { HasItemConditionTriggerNode } from "@node/condition/has-item";
import { ConditionBlueprintNode } from "./blueprint-condition";

class HasItemConditionBlueprintNode extends ConditionBlueprintNode {}

interface HasItemConditionBlueprintNode extends ConditionBlueprintNode {
    get trigger(): HasItemConditionTriggerNode;
}

export { HasItemConditionBlueprintNode };
