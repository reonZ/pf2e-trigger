import { NodeData } from "@data/data-node";
import { ExtractNodeMap } from "@schema/schema-list";
import { Trigger } from "@trigger/trigger";
import { HasItemTriggerNode } from "./condition/trigger-has-item";
import { EventTriggerNode } from "./event/trigger-node-event";
import { TriggerNode } from "./trigger-node";
import { ItemSourceTriggerNode } from "./value/trigger-item-source";
import { RollSaveTriggerNode } from "./action/trigger-roll-save";

const NODES = {
    condition: {
        "has-item": HasItemTriggerNode,
    },
    event: {
        "turn-end": EventTriggerNode,
        "turn-start": EventTriggerNode,
    },
    value: {
        "item-source": ItemSourceTriggerNode,
        "number-value": TriggerNode,
        "success-value": TriggerNode,
    },
    action: {
        "roll-save": RollSaveTriggerNode,
    },
    logic: {
        "eq-number": TriggerNode,
    },
} satisfies ExtractNodeMap<typeof TriggerNode<any>>;

function createTriggerNode(trigger: Trigger, data: NodeData): TriggerNode {
    // @ts-expect-error
    return new NODES[data.type][data.key](trigger, data);
}

export { createTriggerNode };
