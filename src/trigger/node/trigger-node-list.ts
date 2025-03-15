import { MODULE } from "module-helpers";
import { Trigger } from "trigger/trigger";
import { AddImmunityTriggerNode } from "./action/iwr/trigger-action-add-immunity";
import { AddResistanceTriggerNode } from "./action/iwr/trigger-action-add-resistance";
import { AddWeaknessTriggerNode } from "./action/iwr/trigger-action-add-weakness";
import { RemoveImmunityTriggerNode } from "./action/iwr/trigger-action-remove-immunity";
import { AddConditionTriggerNode } from "./action/trigger-action-add-condition";
import { AddItemTriggerAction } from "./action/trigger-action-add-item";
import { AddPersistentTriggerAction } from "./action/trigger-action-add-persistent";
import { AddTemporaryTriggerNode } from "./action/trigger-action-add-temporary";
import { ConsoleLogTriggerNode } from "./action/trigger-action-console-log";
import { GetChoicesetTriggerAction } from "./action/trigger-action-get-choiceset";
import { ReduceConditionTriggerNode } from "./action/trigger-action-reduce-condition";
import { RemoveItemTriggerAction } from "./action/trigger-action-remove-item";
import { RemoveTemporaryTriggerNode } from "./action/trigger-action-remove-temporary";
import { RollDamageTriggerAction } from "./action/trigger-action-roll-damage";
import { RollSaveTriggerAction } from "./action/trigger-action-roll-save";
import { HasItemTriggerCondition } from "./condition/trigger-condition-has-item";
import { HasOptionTriggerCondition } from "./condition/trigger-condition-has-option";
import { HasTemporaryTriggerCondition } from "./condition/trigger-condition-has-temporary";
import { InsideAuraTriggerCondition } from "./condition/trigger-condition-inside-aura";
import { ItemTriggerConverter } from "./converter/trigger-converter-item";
import { TriggerEvent } from "./event/trigger-event";
import { AuraTriggerEvent } from "./event/trigger-event-aura";
import { ExecuteTriggerEvent } from "./event/trigger-event-execute";
import { EqNumberTriggerLogic } from "./logic/trigger-logic-number-eq";
import { GtNumberTriggerLogic } from "./logic/trigger-logic-number-gt";
import { GteNumberTriggerLogic } from "./logic/trigger-logic-number-gte";
import { LtNumberTriggerLogic } from "./logic/trigger-logic-number-lt";
import { LteNumberTriggerLogic } from "./logic/trigger-logic-number-lte";
import { EqTextTriggerLogic } from "./logic/trigger-logic-text-eq";
import { TriggerMacro } from "./macro/trigger-macro";
import { ActorTriggerSplitter } from "./splitter/trigger-splitter-actor";
import { BooleanTriggerSplitter } from "./splitter/trigger-splitter-boolean";
import { ItemTriggerSplitter } from "./splitter/trigger-splitter-item";
import { StringListTriggerSplitter } from "./splitter/trigger-splitter-string-list";
import { SuccessTriggerSplitter } from "./splitter/trigger-splitter-success";
import { InputSubtrigger } from "./subtrigger/trigger-subtrigger-input";
import { NodeSubtrigger } from "./subtrigger/trigger-subtrigger-node";
import { OutputSubtrigger } from "./subtrigger/trigger-subtrigger-output";
import { TriggerNode } from "./trigger-node";
import { DcTriggerValue } from "./value/trigger-value-dc";
import { TargetDcTriggerValue } from "./value/trigger-value-dc-target";
import { SimpleDurationTriggerValue } from "./value/trigger-value-duration-simple";
import { UnitDurationTriggerValue } from "./value/trigger-value-duration-unit";
import { ItemSourceTriggerValue } from "./value/trigger-value-item-source";
import { NumberTriggerValue } from "./value/trigger-value-number";
import { RollDataTriggerValue } from "./value/trigger-value-roll-data";
import { SuccessTriggerValue } from "./value/trigger-value-success";
import { TextTriggerValue } from "./value/trigger-value-text";
import { TriggerVariable } from "./variable/trigger-variable";
import { HasConditionTriggerCondition } from "./condition/trigger-condition-has-condition";
import { InCombatTriggerCondition } from "./condition/trigger-condition-in-combat";
import { IsCombatantTriggerCondition } from "./condition/trigger-condition-is-combatant";

const NODES = {
    action: {
        "add-condition": AddConditionTriggerNode,
        "reduce-condition": ReduceConditionTriggerNode,
        "add-persistent": AddPersistentTriggerAction,
        "add-item": AddItemTriggerAction,
        "remove-item": RemoveItemTriggerAction,
        "roll-damage": RollDamageTriggerAction,
        "roll-save": RollSaveTriggerAction,
        "console-log": ConsoleLogTriggerNode,
        "add-immunity": AddImmunityTriggerNode,
        "remove-immunity": RemoveImmunityTriggerNode,
        "add-temporary": AddTemporaryTriggerNode,
        "remove-temporary": RemoveTemporaryTriggerNode,
        "add-resistance": AddResistanceTriggerNode,
        "add-weakness": AddWeaknessTriggerNode,
        "get-choiceset": GetChoicesetTriggerAction,
    },
    condition: {
        "has-item": HasItemTriggerCondition,
        "has-option": HasOptionTriggerCondition,
        "inside-aura": InsideAuraTriggerCondition,
        "has-temporary": HasTemporaryTriggerCondition,
        "has-condition": HasConditionTriggerCondition,
        "in-combat": InCombatTriggerCondition,
        "is-combatant": IsCombatantTriggerCondition,
    },
    converter: {
        "item-converter": ItemTriggerConverter,
    },
    event: {
        "aura-enter": AuraTriggerEvent,
        "aura-leave": AuraTriggerEvent,
        "test-event": TriggerEvent,
        "token-create": TriggerEvent,
        "token-delete": TriggerEvent,
        "turn-end": TriggerEvent,
        "turn-start": TriggerEvent,
        "execute-event": ExecuteTriggerEvent,
        "region-event": TriggerEvent,
        "damage-received": TriggerEvent,
        "heal-received": TriggerEvent,
    },
    logic: {
        "eq-number": EqNumberTriggerLogic,
        "gt-number": GtNumberTriggerLogic,
        "gte-number": GteNumberTriggerLogic,
        "lt-number": LtNumberTriggerLogic,
        "lte-number": LteNumberTriggerLogic,
        "eq-text": EqTextTriggerLogic,
    },
    macro: {
        macro: TriggerMacro,
    },
    splitter: {
        "success-splitter": SuccessTriggerSplitter,
        "boolean-splitter": BooleanTriggerSplitter,
        "item-splitter": ItemTriggerSplitter,
        "actor-splitter": ActorTriggerSplitter,
        "string-list": StringListTriggerSplitter,
    },
    subtrigger: {
        "subtrigger-input": InputSubtrigger,
        "subtrigger-node": NodeSubtrigger,
        "subtrigger-output": OutputSubtrigger,
    },
    value: {
        "item-source": ItemSourceTriggerValue,
        "number-value": NumberTriggerValue,
        "roll-data": RollDataTriggerValue,
        "text-value": TextTriggerValue,
        "dc-target": TargetDcTriggerValue,
        "dc-value": DcTriggerValue,
        "duration-simple": SimpleDurationTriggerValue,
        "duration-unit": UnitDurationTriggerValue,
        "success-value": SuccessTriggerValue,
    },
    variable: {
        variable: TriggerVariable,
    },
} satisfies ExtractNodeMap<typeof TriggerNode<NodeRawSchema>>;

function createTriggerNode(
    trigger: Trigger,
    data: NodeData,
    schema: NodeSchema
): TriggerNode | null {
    try {
        // @ts-expect-error
        return new NODES[data.type][data.key](trigger, data, schema);
    } catch (error) {
        MODULE.error(`an error occured while creating the node: ${data.type} - ${data.key}`);
    }

    return null;
}

export { createTriggerNode };
