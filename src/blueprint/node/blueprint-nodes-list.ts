import { NodeType, TriggerNode } from "@node/trigger-node";
import { BlueprintNode } from "./blueprint-node";
import { EndTurnEventBlueprintNode, StartTurnEventBlueprintNode } from "./event/blueprint-turn";
import { HasItemConditionBlueprintNode } from "./condition/blueprint-has-item";
import { ItemSourceValueBlueprintNode } from "./value/blueprint-item-source";

const NODES: Record<NodeType, Record<string, typeof BlueprintNode>> = {
    action: {
        // "": ActionTriggerNode,
    },
    condition: {
        "has-item": HasItemConditionBlueprintNode,
    },
    event: {
        "turn-start": StartTurnEventBlueprintNode,
        "turn-end": EndTurnEventBlueprintNode,
    },
    logic: {
        // "": LogicTriggerNode,
    },
    value: {
        "item-source": ItemSourceValueBlueprintNode,
    },
};

function createBlueprintNode(triggerNode: TriggerNode): BlueprintNode {
    // @ts-expect-error
    return new NODES[triggerNode.type][triggerNode.key](triggerNode);
}

export { createBlueprintNode };
