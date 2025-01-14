import { ExtractNodeMap } from "@schema/schema-list";
import { BlueprintNode } from "./blueprint-node";
import { NodeData } from "@data/data-node";
import { ItemSourceBlueprintNode } from "./value/blueprint-item-source";
import { EndTurnBlueprintNode, StartTurnBlueprintNode } from "./event/blueprint-turn-event";
import { HasItemBlueprintNode } from "./condition/blueprint-has-item";
import { RollSaveBlueprintNode } from "./action/blueprint-roll-save";

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
    },
};

function createBlueprintNode(data: NodeData): BlueprintNode {
    // @ts-expect-error
    const node = new NODES[data.type][data.key](data) as BlueprintNode;
    node.initialize();

    return node;
}

export { createBlueprintNode };
