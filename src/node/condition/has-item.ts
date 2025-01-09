import { NodeSchema } from "@node/trigger-node";
import { ConditionTriggerNode } from "./condition";

class HasItemConditionTriggerNode extends ConditionTriggerNode {
    static get entriesSchema(): NodeSchema {
        return {
            inputs: [{ key: "in" }, { key: "item", type: "item" }],
            outputs: [{ key: "true" }, { key: "false" }],
        };
    }
}

export { HasItemConditionTriggerNode };
