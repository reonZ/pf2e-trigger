import { EventBlueprintNode } from "./blueprint-event";

class DamageTakenBlueprintNode extends EventBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\ue4dc", { fontWeight: "900" });
    }
}

export { DamageTakenBlueprintNode };
