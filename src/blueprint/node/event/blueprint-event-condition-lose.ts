import { EventBlueprintNode } from "./blueprint-event";

class LoseConditionBlueprintNode extends EventBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\ue54d", { fontWeight: "400" });
    }
}

export { LoseConditionBlueprintNode };
