import { NodeData } from "@data/data-node";
import { ExtractNodeMap } from "@schema/schema-list";
import { Trigger } from "@trigger/trigger";
import { RollSaveTriggerNode } from "./action/trigger-roll-save";
import { HasItemTriggerNode } from "./condition/trigger-has-item";
import { EventTriggerNode } from "./event/trigger-node-event";
import { TriggerNode } from "./trigger-node";
import { ItemSourceTriggerNode } from "./value/trigger-item-source";
import { SuccessValueTriggerNode } from "./value/trigger-success-value";
import { EqNumberTriggerNode } from "./logic/trigger-eq-number";
import { GtNumberTriggerNode } from "./logic/trigger-gt-number";
import { LtNumberTriggerNode } from "./logic/trigger-lt-number";
import { GteNumberTriggerNode } from "./logic/trigger-gte-number";
import { LteNumberTriggerNode } from "./logic/trigger-lte-number";
import { RollDamageTriggerNode } from "./action/trigger-roll-damage";

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
        "success-value": SuccessValueTriggerNode,
    },
    action: {
        "roll-save": RollSaveTriggerNode,
        "roll-damage": RollDamageTriggerNode,
    },
    logic: {
        "eq-number": EqNumberTriggerNode,
        "gt-number": GtNumberTriggerNode,
        "lt-number": LtNumberTriggerNode,
        "gte-number": GteNumberTriggerNode,
        "lte-number": LteNumberTriggerNode,
    },
} satisfies ExtractNodeMap<typeof TriggerNode<any>>;

function createTriggerNode(trigger: Trigger, data: NodeData): TriggerNode {
    // @ts-expect-error
    return new NODES[data.type][data.key](trigger, data);
}

export { createTriggerNode };
