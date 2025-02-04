import { EventSubtriggerBlueprintNode } from "./blueprint-subtrigger-event";

class OutputSubtriggerBlueprintNode extends EventSubtriggerBlueprintNode {
    get icon() {
        return "\uf2f5";
    }

    get canDrag(): boolean {
        return true;
    }

    get context() {
        return ["add-input"];
    }
}

export { OutputSubtriggerBlueprintNode };
