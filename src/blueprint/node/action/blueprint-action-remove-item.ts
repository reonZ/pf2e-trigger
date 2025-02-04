import { ActionBlueprintNode } from "./blueprint-action";

class RemoveItemBlueprintNode extends ActionBlueprintNode {
    get icon(): string {
        return "\uf1f8";
    }
}

export { RemoveItemBlueprintNode };
