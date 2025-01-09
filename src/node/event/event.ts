import { NodeSchema, TriggerNode } from "@node/trigger-node";

abstract class EventTriggerNode extends TriggerNode {
    get schema(): NodeSchema {
        return {
            outputs: [{ key: "out", label: "target" }],
        };
    }
}

export { EventTriggerNode };
