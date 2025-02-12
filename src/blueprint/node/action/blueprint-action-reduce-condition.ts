import { ActionBlueprintNode } from "./blueprint-action";

class ReduceConditionBlueprintNode extends ActionBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\ue54d", { fontWeight: "400" });
    }
}

export { ReduceConditionBlueprintNode };
