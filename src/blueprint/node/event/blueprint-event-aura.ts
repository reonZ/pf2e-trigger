import { EventBlueprintNode } from "./blueprint-event";

class EnterAuraBlueprintNode extends EventBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\uf192", { fontWeight: "900" });
    }
}

class LeaveAuraBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\uf192";
    }
}

export { EnterAuraBlueprintNode, LeaveAuraBlueprintNode };
