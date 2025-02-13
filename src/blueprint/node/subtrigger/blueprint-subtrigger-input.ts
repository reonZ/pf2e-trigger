import { BlueprintEntry } from "blueprint/entry/blueprint-entry";
import { EventSubtriggerBlueprintNode } from "./blueprint-subtrigger-event";

class InputSubtriggerBlueprintNode extends EventSubtriggerBlueprintNode {
    get icon() {
        return "\uf2f6";
    }

    get context() {
        return ["add-output"];
    }

    getConnectionContext(entry: BlueprintEntry): string[] {
        const context = super.getConnectionContext(entry);
        return entry.key === "this" ? context.filter((x) => x !== "remove-connection") : context;
    }
}

export { InputSubtriggerBlueprintNode };
