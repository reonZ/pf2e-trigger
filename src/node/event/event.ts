import { NodeSchema, TriggerNode } from "@node/trigger-node";

abstract class EventTriggerNode extends TriggerNode {
    static get isUnique(): boolean {
        return true;
    }

    static get schema(): NodeSchema {
        return {
            outputs: [{ key: "out", label: "target" }],
        };
    }
}

export { EventTriggerNode };
