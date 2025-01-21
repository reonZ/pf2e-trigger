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

const NODES: ExtractNodeMap<typeof BlueprintNode> = {
    action: {
        "roll-save": RollSaveBlueprintNode,
        "roll-damage": RollDamageBlueprintNode,
    },
    condition: {
        "has-item": HasItemBlueprintNode,
        "in-aura": InsideAuraBlueprintNode,
    },
    event: {
        "turn-end": EndTurnBlueprintNode,
        "turn-start": StartTurnBlueprintNode,
    },
    logic: {
        "eq-number": EqValueBlueprintNode,
        "gt-number": GtValueBlueprintNode,
        "lt-number": LtValueBlueprintNode,
        "gte-number": GteValueBlueprintNode,
        "lte-number": LteValueBlueprintNode,
        // "eq-text": EqValueBlueprintNode,
    },
    value: {
        "item-source": ItemSourceBlueprintNode,
        "number-value": ValueBlueprintNode,
        "success-value": ValueBlueprintNode,
    },
};

function createBlueprintNode(data: NodeData): BlueprintNode {
    // @ts-expect-error
    const node = new NODES[data.type][data.key](data) as BlueprintNode;
    node.initialize();

    return node;
}

export { createBlueprintNode };
