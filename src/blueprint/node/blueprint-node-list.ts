import { ExtractNodeMap } from "@schema/schema-list";
import { BlueprintNode } from "./blueprint-node";
import { NodeData } from "@data/data-node";
import { ItemSourceBlueprintNode } from "./value/blueprint-item-source";
import { EndTurnBlueprintNode, StartTurnBlueprintNode } from "./event/blueprint-turn-event";
import { HasItemBlueprintNode } from "./condition/blueprint-has-item";
import { RollSaveBlueprintNode } from "./action/blueprint-roll-save";
import { EqBlueprintNode } from "./logic/eq-node";
import { ValueBlueprintNode } from "./value/blueprint-value-node";

const NODES: ExtractNodeMap<typeof BlueprintNode> = {
    action: {
        "roll-save": RollSaveBlueprintNode,
    },
    condition: {
        "has-item": HasItemBlueprintNode,
    },
    event: {
        "turn-end": EndTurnBlueprintNode,
        "turn-start": StartTurnBlueprintNode,
    },
    value: {
        "item-source": ItemSourceBlueprintNode,
        "number-value": ValueBlueprintNode,
        "success-value": ValueBlueprintNode,
    },
    logic: {
        "eq-number": EqBlueprintNode,
        // "eq-text": EqBlueprintNode,
    },
};

function createBlueprintNode(data: NodeData): BlueprintNode {
    // @ts-expect-error
    const node = new NODES[data.type][data.key](data) as BlueprintNode;
    node.initialize();

    return node;
}

export { createBlueprintNode };
