import { EventBlueprintNode } from "./blueprint-event";

class LoseItemBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\uf1f8";
    }
}

export { LoseItemBlueprintNode };
