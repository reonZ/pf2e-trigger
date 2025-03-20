import { EventBlueprintNode } from "./blueprint-event";

class HealGainBlueprintNode extends EventBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\uf004", { fontWeight: "900" });
    }
}

export { HealGainBlueprintNode };
