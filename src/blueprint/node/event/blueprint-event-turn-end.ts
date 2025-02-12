import { EventBlueprintNode } from "./blueprint-event";

class EndTurnBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\uf253";
    }
}

export { EndTurnBlueprintNode };
