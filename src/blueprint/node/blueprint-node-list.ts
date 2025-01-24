import { ExtractNodeMap } from "schema/schema-list";
import { BlueprintNode } from "./blueprint-node";
import { NodeData } from "data/data-node";
import { ItemSourceBlueprintNode } from "./value/blueprint-item-source";
import { EndTurnBlueprintNode, StartTurnBlueprintNode } from "./event/blueprint-turn-event";
import { HasItemBlueprintNode } from "./condition/blueprint-has-item";
import { RollSaveBlueprintNode } from "./action/blueprint-roll-save";
import { ValueBlueprintNode } from "./value/blueprint-value-node";
import { EqValueBlueprintNode } from "./logic/blueprint-eq-value";
import { GtValueBlueprintNode } from "./logic/blueprint-gt-value";
import { LtValueBlueprintNode } from "./logic/blueprint-lt-value";
import { GteValueBlueprintNode } from "./logic/blueprint-gte-value";
import { LteValueBlueprintNode } from "./logic/blueprint-lte-value";
import { RollDamageBlueprintNode } from "./action/blueprint-roll-damage";
import { InsideAuraBlueprintNode } from "./condition/blueprint-inside-aura";
import { EnterAuraBlueprintNode, LeaveAuraBlueprintNode } from "./event/blueprint-aura-event";
import { HasOptionBlueprintNode } from "./condition/blueprint-has-option";
import { RemoveItemBlueprintNode } from "./action/blueprint-remove-item";
import { RunMacroBlueprintNode } from "./action/blueprint-run-macro";
import { MacroSourceBlueprintNode } from "./value/blueprint-macro-source";
import { CreateTokenBlueprintNode, DeleteTokenBlueprintNode } from "./event/blueprint-token.event";
import { AddItemBlueprintNode } from "./action/blueprint-add-item";
import { SuccessSplitBlueprintNode } from "./logic/blueprint-success-split";
import { VariableBlueprintNode } from "./blueprint-variable-node";
import { TestEventBlueprintNode } from "./event/blueprint-test-event";

const NODES: ExtractNodeMap<typeof BlueprintNode> = {
    action: {
        "roll-save": RollSaveBlueprintNode,
        "roll-damage": RollDamageBlueprintNode,
        "add-item": AddItemBlueprintNode,
        "remove-item": RemoveItemBlueprintNode,
        "run-macro": RunMacroBlueprintNode,
    },
    condition: {
        "has-item": HasItemBlueprintNode,
        "has-option": HasOptionBlueprintNode,
        "inside-aura": InsideAuraBlueprintNode,
    },
    event: {
        "aura-enter": EnterAuraBlueprintNode,
        "aura-leave": LeaveAuraBlueprintNode,
        "turn-end": EndTurnBlueprintNode,
        "turn-start": StartTurnBlueprintNode,
        "token-create": CreateTokenBlueprintNode,
        "token-delete": DeleteTokenBlueprintNode,
        "test-event": TestEventBlueprintNode,
    },
    logic: {
        "eq-number": EqValueBlueprintNode,
        "gt-number": GtValueBlueprintNode,
        "lt-number": LtValueBlueprintNode,
        "gte-number": GteValueBlueprintNode,
        "lte-number": LteValueBlueprintNode,
        // "eq-text": EqValueBlueprintNode,
        "success-split": SuccessSplitBlueprintNode,
    },
    value: {
        "item-source": ItemSourceBlueprintNode,
        "macro-source": MacroSourceBlueprintNode,
        "number-value": ValueBlueprintNode,
        "success-value": ValueBlueprintNode,
    },
    variable: {
        variable: VariableBlueprintNode,
    },
};

function createBlueprintNode(data: NodeData): BlueprintNode {
    // @ts-expect-error
    const node = new NODES[data.type][data.key](data) as BlueprintNode;
    node.initialize();

    return node;
}

export { createBlueprintNode };
