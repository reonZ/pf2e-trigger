import { EventBlueprintNode } from "./blueprint-event";

class HealReceivedBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\uf481";
    }
}

export { HealReceivedBlueprintNode };
