import { NodeSchema } from "@node/trigger-node";
import { ValueTriggerNode } from "./value";

class ItemSourceValueTriggerNode extends ValueTriggerNode {
    static get schema(): NodeSchema {
        return {
            inputs: [{ key: "uuid", type: "uuid" }],
            outputs: [{ key: "item", type: "item" }],
        };
    }
}

export { ItemSourceValueTriggerNode };
