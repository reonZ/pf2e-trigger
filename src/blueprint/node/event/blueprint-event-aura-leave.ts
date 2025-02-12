import { EventBlueprintNode } from "./blueprint-event";

class LeaveAuraBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\uf192";
    }
}

export { LeaveAuraBlueprintNode };
