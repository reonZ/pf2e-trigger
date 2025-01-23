import { NodeData } from "data/data-node";
import { ExtractNodeMap } from "schema/schema-list";
import { Trigger } from "trigger/trigger";
import { AddItemTriggerNode } from "./action/trigger-add-item";
import { RemoveItemTriggerNode } from "./action/trigger-remove-item";
import { RollDamageTriggerNode } from "./action/trigger-roll-damage";
import { RollSaveTriggerNode } from "./action/trigger-roll-save";
import { RunMacroTriggerNode } from "./action/trigger-run-macro";
import { HasItemTriggerNode } from "./condition/trigger-has-item";
import { HasOptionTriggerNode } from "./condition/trigger-has-option";
import { InsideAuraTriggerNode } from "./condition/trigger-inside-aura";
import { AuraEventTriggerNode } from "./event/trigger-aura-event";
import { EventTriggerNode } from "./event/trigger-node-event";
import { EqNumberTriggerNode } from "./logic/trigger-eq-number";
import { GtNumberTriggerNode } from "./logic/trigger-gt-number";
import { GteNumberTriggerNode } from "./logic/trigger-gte-number";
import { LtNumberTriggerNode } from "./logic/trigger-lt-number";
import { LteNumberTriggerNode } from "./logic/trigger-lte-number";
import { SuccessSplitTriggerNode } from "./logic/trigger-success-split";
import { TriggerNode } from "./trigger-node";
import { VariableTriggerNode } from "./trigger-variable";
import { ItemSourceTriggerNode } from "./value/trigger-item-source";
import { MacroSourceTriggerNode } from "./value/trigger-macro-source";
import { SuccessValueTriggerNode } from "./value/trigger-success-value";

const NODES = {
    action: {
        "roll-save": RollSaveTriggerNode,
        "roll-damage": RollDamageTriggerNode,
        "add-item": AddItemTriggerNode,
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
        "success-split": SuccessSplitTriggerNode,
    },
    value: {
        "item-source": ItemSourceTriggerNode,
        "macro-source": MacroSourceTriggerNode,
        "number-value": TriggerNode,
        "success-value": SuccessValueTriggerNode,
    },
    variable: {
        variable: VariableTriggerNode,
    },
} satisfies ExtractNodeMap<typeof TriggerNode<any>>;

function createTriggerNode(trigger: Trigger, data: NodeData): TriggerNode {
    // @ts-expect-error
    return new NODES[data.type][data.key](trigger, data);
}

export { createTriggerNode };
