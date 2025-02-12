import { ActionBlueprintNode } from "./blueprint-action";

class AddConditionBlueprintNode extends ActionBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\ue54d", { fontWeight: "900" });
    }
}

export { AddConditionBlueprintNode };
