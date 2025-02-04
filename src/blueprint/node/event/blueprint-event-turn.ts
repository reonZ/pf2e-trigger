import { EventBlueprintNode } from "./blueprint-event";

class StartTurnBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\uf251";
    }
}

class EndTurnBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\uf253";
    }
}

export { EndTurnBlueprintNode, StartTurnBlueprintNode };
