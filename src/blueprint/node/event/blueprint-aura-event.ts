import { EventBlueprintNode } from "./blueprint-event-node";

abstract class AuraEventBlueprintNode extends EventBlueprintNode {}

class EnterAuraBlueprintNode extends AuraEventBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\uf192", { fontWeight: "900" });
    }
}

class LeaveAuraBlueprintNode extends AuraEventBlueprintNode {
    get icon(): string {
        return "\uf192";
    }
}

export { EnterAuraBlueprintNode, LeaveAuraBlueprintNode };
