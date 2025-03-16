import { EventBlueprintNode } from "./blueprint-event";

class GainConditionBlueprintNode extends EventBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\ue54d", { fontWeight: "900" });
    }
}

export { GainConditionBlueprintNode };
