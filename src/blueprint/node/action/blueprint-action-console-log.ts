import { makeCustomNode } from "../blueprint-node-custom";
import { ActionBlueprintNode } from "./blueprint-action";

class ConsoleLogBlueprintNode extends makeCustomNode(ActionBlueprintNode) {
    get icon(): string {
        return "\uf120";
    }

    get context() {
        return ["add-input", ...super.context];
    }
}

export { ConsoleLogBlueprintNode };
