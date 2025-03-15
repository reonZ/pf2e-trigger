import { Blueprint } from "blueprint/blueprint";
import { AddConditionBlueprintNode } from "./action/blueprint-action-add-condition";
import { AddItemBlueprintNode } from "./action/blueprint-action-add-item";
import { AddPersistentBlueprintNode } from "./action/blueprint-action-add-persistent";
import { AddTemporartyBlueprintNode } from "./action/blueprint-action-add-temporary";
import { ConsoleLogBlueprintNode } from "./action/blueprint-action-console-log";
import { GetChoicesetBlueprintNode } from "./action/blueprint-action-get-choiceset";
import { ReduceConditionBlueprintNode } from "./action/blueprint-action-reduce-condition";
import { RemoveItemBlueprintNode } from "./action/blueprint-action-remove-item";
import { RemoveTemporartyBlueprintNode } from "./action/blueprint-action-remove-temporary";
import { RollDamageBlueprintNode } from "./action/blueprint-action-roll-damage";
import { RollSaveBlueprintNode } from "./action/blueprint-action-roll-save";
import { AddImmunityBlueprintNode } from "./action/iwr/blueprint-action-add-immunity";
import { AddResistanceBlueprintNode } from "./action/iwr/blueprint-action-add-resistance";
import { AddWeaknessBlueprintNode } from "./action/iwr/blueprint-action-add-weakness";
import { BlueprintNode } from "./blueprint-node";
import { ConditionBlueprintNode } from "./condition/blueprint-condition";
import { ConverterBlueprintNode } from "./converter/blueprint-converter";
import { EnterAuraBlueprintNode } from "./event/blueprint-event-aura-enter";
import { LeaveAuraBlueprintNode } from "./event/blueprint-event-aura-leave";
import { ExecuteEventBlueprintNode } from "./event/blueprint-event-execute";
import { RegionEventBlueprintNode } from "./event/blueprint-event-region";
import { TestEventBlueprintNode } from "./event/blueprint-event-test";
import { CreateTokenBlueprintNode } from "./event/blueprint-event-token-create";
import { DeleteTokenBlueprintNode } from "./event/blueprint-event-token-delete";
import { EndTurnBlueprintNode } from "./event/blueprint-event-turn-end";
import { StartTurnBlueprintNode } from "./event/blueprint-event-turn-start";
import { EqValueBlueprintNode } from "./logic/blueprint-logic-eq";
import { GtValueBlueprintNode } from "./logic/blueprint-logic.gt";
import { GteValueBlueprintNode } from "./logic/blueprint-logic.gte";
import { LtValueBlueprintNode } from "./logic/blueprint-logic.lt";
import { LteValueBlueprintNode } from "./logic/blueprint-logic.lte";
import { MacroBlueprintNode } from "./macro/blueprint-macro";
import { SplitterBlueprintNode } from "./splitter/blueprint-splitter";
import { DocumentExtractorBlueprintNode } from "./splitter/blueprint-splitter-extractor";
import { StringListSplitterBlueprintNode } from "./splitter/blueprint-splitter-string-list";
import { InputSubtriggerBlueprintNode } from "./subtrigger/blueprint-subtrigger-input";
import { SubtriggerBlueprintNode } from "./subtrigger/blueprint-subtrigger-node";
import { OutputSubtriggerBlueprintNode } from "./subtrigger/blueprint-subtrigger-output";
import { ItemSourceBlueprintNode } from "./value/blueprint-value-item-source";
import { ValueBlueprintNode } from "./value/blueprint-value-node";
import { VariableBlueprintNode } from "./variable/blueprint-variable";
import { DamageReceivedBlueprintNode } from "./event/blueprint-event-damage";
import { HealReceivedBlueprintNode } from "./event/blueprint-event-heal";

const NODES: ExtractNodeMap<typeof BlueprintNode> = {
    action: {
        "add-item": AddItemBlueprintNode,
        "add-condition": AddConditionBlueprintNode,
        "reduce-condition": ReduceConditionBlueprintNode,
        "add-persistent": AddPersistentBlueprintNode,
        "remove-item": RemoveItemBlueprintNode,
        "roll-save": RollSaveBlueprintNode,
        "roll-damage": RollDamageBlueprintNode,
        "console-log": ConsoleLogBlueprintNode,
        "add-immunity": AddImmunityBlueprintNode,
        "remove-immunity": RemoveItemBlueprintNode,
        "add-temporary": AddTemporartyBlueprintNode,
        "remove-temporary": RemoveTemporartyBlueprintNode,
        "add-resistance": AddResistanceBlueprintNode,
        "add-weakness": AddWeaknessBlueprintNode,
        "get-choiceset": GetChoicesetBlueprintNode,
    },
    condition: {
        "has-item": ConditionBlueprintNode,
        "has-option": ConditionBlueprintNode,
        "inside-aura": ConditionBlueprintNode,
        "has-temporary": ConditionBlueprintNode,
        "has-condition": ConditionBlueprintNode,
        "in-combat": ConditionBlueprintNode,
        "is-combatant": ConditionBlueprintNode,
    },
    converter: {
        "item-converter": ConverterBlueprintNode,
    },
    event: {
        "test-event": TestEventBlueprintNode,
        "token-create": CreateTokenBlueprintNode,
        "token-delete": DeleteTokenBlueprintNode,
        "turn-end": EndTurnBlueprintNode,
        "turn-start": StartTurnBlueprintNode,
        "aura-enter": EnterAuraBlueprintNode,
        "aura-leave": LeaveAuraBlueprintNode,
        "execute-event": ExecuteEventBlueprintNode,
        "region-event": RegionEventBlueprintNode,
        "damage-received": DamageReceivedBlueprintNode,
        "heal-received": HealReceivedBlueprintNode,
    },
    logic: {
        "eq-number": EqValueBlueprintNode,
        "gt-number": GtValueBlueprintNode,
        "gte-number": GteValueBlueprintNode,
        "lt-number": LtValueBlueprintNode,
        "lte-number": LteValueBlueprintNode,
        "eq-text": EqValueBlueprintNode,
    },
    macro: {
        macro: MacroBlueprintNode,
    },
    splitter: {
        "success-splitter": SplitterBlueprintNode,
        "boolean-splitter": SplitterBlueprintNode,
        "item-splitter": DocumentExtractorBlueprintNode,
        "actor-splitter": DocumentExtractorBlueprintNode,
        "string-list": StringListSplitterBlueprintNode,
    },
    subtrigger: {
        "subtrigger-input": InputSubtriggerBlueprintNode,
        "subtrigger-output": OutputSubtriggerBlueprintNode,
        "subtrigger-node": SubtriggerBlueprintNode,
    },
    value: {
        "number-value": ValueBlueprintNode,
        "text-value": ValueBlueprintNode,
        "item-source": ItemSourceBlueprintNode,
        "roll-data": ValueBlueprintNode,
        "dc-target": ValueBlueprintNode,
        "dc-value": ValueBlueprintNode,
        "duration-simple": ValueBlueprintNode,
        "duration-unit": ValueBlueprintNode,
        "success-value": ValueBlueprintNode,
    },
    variable: {
        variable: VariableBlueprintNode,
    },
};

function createBlueprintNode(blueprint: Blueprint, data: NodeData): BlueprintNode {
    // @ts-expect-error
    const node = new NODES[data.type][data.key](blueprint, data) as BlueprintNode;
    node.initialize();

    return node;
}

export { createBlueprintNode };
