import { ActionBlueprintNode } from "./blueprint-action";

class AddItemBlueprintNode extends ActionBlueprintNode {
    get icon(): string {
        return "\uf466";
    }
}

export { AddItemBlueprintNode };
