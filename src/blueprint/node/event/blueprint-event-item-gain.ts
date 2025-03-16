import { EventBlueprintNode } from "./blueprint-event";

class GainItemBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\uf466";
    }
}

export { GainItemBlueprintNode };
