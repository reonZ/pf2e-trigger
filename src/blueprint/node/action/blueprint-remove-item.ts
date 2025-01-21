import { ActionBlueprintNode } from "./blueprint-action-node";

class RemoveItemBlueprintNode extends ActionBlueprintNode {
    get icon(): string {
        return "\uf1f8";
    }
}

export { RemoveItemBlueprintNode };
