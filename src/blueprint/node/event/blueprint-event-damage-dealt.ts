import { EventBlueprintNode } from "./blueprint-event";

class DamageDealtBlueprintNode extends EventBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\ue24b", { fontWeight: "900" });
    }
}

export { DamageDealtBlueprintNode };
