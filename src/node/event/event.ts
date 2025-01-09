import { NodeSchema, TriggerNode } from "@node/trigger-node";

abstract class EventTriggerNode extends TriggerNode {
    get schema(): NodeSchema {
        return {
            unique: true,
            outputs: [{ key: "out", label: "target" }],
        };
    }
}

export { EventTriggerNode };
