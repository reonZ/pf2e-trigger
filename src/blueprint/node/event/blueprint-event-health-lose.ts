import { EventBlueprintNode } from "./blueprint-event";

class HealthLoseBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\uf004";
    }
}

export { HealthLoseBlueprintNode };
