import { Blueprint } from "blueprint/blueprint";
import { AddConditionBlueprintNode } from "./action/blueprint-action-add-condition";
import { AddItemBlueprintNode } from "./action/blueprint-action-add-item";
import { RemoveItemBlueprintNode } from "./action/blueprint-action-remove-item";
import { RollDamageBlueprintNode } from "./action/blueprint-action-roll-damage";
import { RollSaveBlueprintNode } from "./action/blueprint-action-roll-save";
import { BlueprintNode } from "./blueprint-node";
import { ConditionBlueprintNode } from "./condition/blueprint-condition";
import { ConverterBlueprintNode } from "./converter/blueprint-converter";
import { EnterAuraBlueprintNode, LeaveAuraBlueprintNode } from "./event/blueprint-event-aura";
import { TestEventBlueprintNode } from "./event/blueprint-event-test";
import { CreateTokenBlueprintNode, DeleteTokenBlueprintNode } from "./event/blueprint-event-token";
import { EndTurnBlueprintNode, StartTurnBlueprintNode } from "./event/blueprint-event-turn";
import { EqValueBlueprintNode } from "./logic/blueprint-logic-eq";
import { GtValueBlueprintNode } from "./logic/blueprint-logic.gt";
import { GteValueBlueprintNode } from "./logic/blueprint-logic.gte";
import { LtValueBlueprintNode } from "./logic/blueprint-logic.lt";
import { LteValueBlueprintNode } from "./logic/blueprint-logic.lte";
import { InputSubtriggerBlueprintNode } from "./subtrigger/blueprint-subtrigger-input";
import { SubtriggerBlueprintNode } from "./subtrigger/blueprint-subtrigger-node";
import { OutputSubtriggerBlueprintNode } from "./subtrigger/blueprint-subtrigger-output";
import { ItemSourceBlueprintNode } from "./value/blueprint-value-item-source";
import { ValueBlueprintNode } from "./value/blueprint-value-node";
import { VariableBlueprintNode } from "./variable/blueprint-variable";
import { MacroBlueprintNode } from "./macro/blueprint-macro";
import { SplitterBlueprintNode } from "./splitter/blueprint-splitter";
import { AddPersistentBlueprintNode } from "./action/blueprint-action-add-persistent";
import { ExecuteEventBlueprintNode } from "./event/blueprint-event-execute";
import { ConsoleLogBlueprintNode } from "./action/blueprint-action-console-log";
import { AddImmunityBlueprintNode } from "./action/iwr/blueprint-action-add-immunity";
import { AddTemporartyBlueprintNode } from "./action/blueprint-action-add-temporary";
import { RemoveTemporartyBlueprintNode } from "./action/blueprint-action-remove-temporary";
import { AddResistanceBlueprintNode } from "./action/iwr/blueprint-action-add-resistance";
import { AddWeaknessBlueprintNode } from "./action/iwr/blueprint-action-add-weakness";

const NODES: ExtractNodeMap<typeof BlueprintNode> = {
    action: {
        "add-item": AddItemBlueprintNode,
        "add-condition": AddConditionBlueprintNode,
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
    },
    condition: {
        "has-item": ConditionBlueprintNode,
        "has-option": ConditionBlueprintNode,
        "inside-aura": ConditionBlueprintNode,
        "has-temporary": ConditionBlueprintNode,
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
    },
    logic: {
        "eq-number": EqValueBlueprintNode,
        "gt-number": GtValueBlueprintNode,
        "gte-number": GteValueBlueprintNode,
        "lt-number": LtValueBlueprintNode,
        "lte-number": LteValueBlueprintNode,
    },
    macro: {
        macro: MacroBlueprintNode,
    },
    splitter: {
        "success-splitter": SplitterBlueprintNode,
        "boolean-splitter": SplitterBlueprintNode,
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
