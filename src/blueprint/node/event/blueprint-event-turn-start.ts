import { EventBlueprintNode } from "./blueprint-event";

class StartTurnBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\uf251";
    }
}

export { StartTurnBlueprintNode };
