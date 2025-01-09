import { NodeSchema } from "@node/trigger-node";
import { ConditionTriggerNode } from "./condition";

class HasItemConditionTriggerNode extends ConditionTriggerNode {
    get schema(): NodeSchema {
        return {
            inputs: [{ key: "in" }, { key: "item", type: "item" }],
            outputs: [{ key: "true" }, { key: "false" }],
        };
    }
}

export { HasItemConditionTriggerNode };
