import { EventBlueprintNode } from "./blueprint-event";

class EnterAuraBlueprintNode extends EventBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\uf192", { fontWeight: "900" });
    }
}

export { EnterAuraBlueprintNode };
