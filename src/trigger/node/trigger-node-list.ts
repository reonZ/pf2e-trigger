import { NodeData } from "data/data-node";
import { ExtractNodeMap } from "schema/schema-list";
import { Trigger } from "trigger/trigger";
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
import { InsideAuraTriggerNode } from "./condition/trigger-inside-aura";
import { AuraEventTriggerNode } from "./event/trigger-aura-event";
import { HasOptionTriggerNode } from "./condition/trigger-has-option";
import { RemoveItemTriggerNode } from "./action/trigger-remove-item";
import { RunMacroTriggerNode } from "./action/trigger-run-macro";
import { MacroSourceTriggerNode } from "./value/trigger-macro-source";

const NODES = {
    action: {
        "roll-save": RollSaveTriggerNode,
        "roll-damage": RollDamageTriggerNode,
        "remove-item": RemoveItemTriggerNode,
        "run-macro": RunMacroTriggerNode,
    },
    condition: {
        "has-item": HasItemTriggerNode,
        "has-option": HasOptionTriggerNode,
        "inside-aura": InsideAuraTriggerNode,
    },
    event: {
        "aura-enter": AuraEventTriggerNode,
        "aura-leave": AuraEventTriggerNode,
        "turn-end": EventTriggerNode,
        "turn-start": EventTriggerNode,
        "token-create": EventTriggerNode,
        "token-delete": EventTriggerNode,
    },
    logic: {
        "eq-number": EqNumberTriggerNode,
        "gt-number": GtNumberTriggerNode,
        "lt-number": LtNumberTriggerNode,
        "gte-number": GteNumberTriggerNode,
        "lte-number": LteNumberTriggerNode,
    },
    value: {
        "item-source": ItemSourceTriggerNode,
        "macro-source": MacroSourceTriggerNode,
        "number-value": TriggerNode,
        "success-value": SuccessValueTriggerNode,
    },
} satisfies ExtractNodeMap<typeof TriggerNode<any>>;

function createTriggerNode(trigger: Trigger, data: NodeData): TriggerNode {
    // @ts-expect-error
    return new NODES[data.type][data.key](trigger, data);
}

export { createTriggerNode };
