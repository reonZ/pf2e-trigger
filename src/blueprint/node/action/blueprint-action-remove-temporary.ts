import { ActionBlueprintNode } from "./blueprint-action";

class RemoveTemporartyBlueprintNode extends ActionBlueprintNode {
    get icon(): string {
        return "\uf017";
    }
}

export { RemoveTemporartyBlueprintNode };
