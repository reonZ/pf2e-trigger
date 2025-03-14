import { EventSubtriggerBlueprintNode } from "./blueprint-subtrigger-event";

class InputSubtriggerBlueprintNode extends EventSubtriggerBlueprintNode {
    get icon() {
        return "\uf2f6";
    }

    get context() {
        return ["add-output"];
    }
}

export { InputSubtriggerBlueprintNode };
