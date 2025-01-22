import { ActionBlueprintNode } from "./blueprint-action-node";

class RunMacroBlueprintNode extends ActionBlueprintNode {
    get icon(): string {
        return "\uf121";
    }
}

export { RunMacroBlueprintNode };
