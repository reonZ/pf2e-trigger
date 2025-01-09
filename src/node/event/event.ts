import { NodeSchema, TriggerNode } from "@node/trigger-node";

abstract class EventTriggerNode extends TriggerNode {
    static get unique(): boolean {
        return true;
    }

    static get entriesSchema(): NodeSchema {
        return {
            outputs: [{ key: "out", label: "target" }],
        };
    }
}

export { EventTriggerNode };
