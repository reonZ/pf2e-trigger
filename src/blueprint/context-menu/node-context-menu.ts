import { BlueprintNode } from "@blueprint/node/blueprint-node";
import { BlueprintContextMenu } from "./context-menu";

class NodeContextMenu extends BlueprintContextMenu<NodeContextMenuValue, BlueprintNode> {
    get entries(): NodeContextMenuValue[] {
        return ["delete"];
    }
}

type NodeContextMenuValue = "delete";

export { NodeContextMenu };
export type { NodeContextMenuValue };
