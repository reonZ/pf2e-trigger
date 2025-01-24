import { EventBlueprintNode } from "./blueprint-event-node";

class TestEventBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\ue4f3";
    }

    get subtitle(): string {
        return "game.trigger.test()";
    }
}

export { TestEventBlueprintNode };
