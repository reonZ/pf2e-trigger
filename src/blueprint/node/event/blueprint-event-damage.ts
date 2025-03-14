import { EventBlueprintNode } from "./blueprint-event";

class DamageReceivedBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\ue4dc";
    }
}

export { DamageReceivedBlueprintNode };
