import { ActionBlueprintNode } from "./blueprint-action";

class RollDamageBlueprintNode extends ActionBlueprintNode {
    get icon(): string {
        return "\uf71c";
    }
}

export { RollDamageBlueprintNode };
