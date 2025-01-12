import { EventBlueprintNode } from "./blueprint-event-node";

abstract class TurnEventBlueprintNode extends EventBlueprintNode {}

class StartTurnBlueprintNode extends TurnEventBlueprintNode {
    get icon(): string {
        return "\uf251";
    }
}

class EndTurnBlueprintNode extends TurnEventBlueprintNode {
    get icon(): string {
        return "\uf253";
    }
}

export { StartTurnBlueprintNode, EndTurnBlueprintNode };
