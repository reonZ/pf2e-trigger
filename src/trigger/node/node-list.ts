import { NodeType, TriggerNodeData } from "data";
import { MODULE } from "module-helpers";
import { NodeKey } from "schema";
import {
    action,
    condition,
    event,
    logic,
    splitter,
    subtrigger,
    Trigger,
    TriggerNode,
    value,
    variable,
} from "trigger";

const TRIGGER_NODES = {
    action,
    condition,
    event,
    logic,
    splitter,
    subtrigger,
    value,
    variable,
} satisfies Record<NodeType, PartialRecord<NodeKey, typeof TriggerNode>>;

function createTriggerNode(trigger: Trigger, data: TriggerNodeData): TriggerNode {
    const { type, key } = data;
    // @ts-expect-error
    const Node = TRIGGER_NODES[type]?.[key];

    if (!Node) {
        throw MODULE.error(`The TriggerNode of type '${type}' and key '${key}' does not exist`);
    }

    return new Node(trigger, data);
}

export { createTriggerNode };
