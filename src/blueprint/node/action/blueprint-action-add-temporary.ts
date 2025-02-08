import { ActionBlueprintNode } from "./blueprint-action";

class AddTemporartyBlueprintNode extends ActionBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\uf017", { fontWeight: "900" });
    }
}

export { AddTemporartyBlueprintNode };
