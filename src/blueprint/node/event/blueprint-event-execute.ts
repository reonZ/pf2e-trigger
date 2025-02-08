import { BlueprintEntry } from "blueprint/entry/blueprint-entry";
import { makeCustomNode } from "../blueprint-node-custom";
import { EventBlueprintNode } from "./blueprint-event";
import { info } from "module-helpers";

class ExecuteEventBlueprintNode extends makeCustomNode(EventBlueprintNode) {
    get icon(): string {
        return "\uf144";
    }

    get subtitle(): string {
        return this.trigger.id;
    }

    get context(): string[] {
        return ["copy-id", "add-output", ...super.context];
    }

    getConnectionContext(entry: BlueprintEntry): string[] {
        const context = super.getConnectionContext(entry);
        return entry.key === "this" ? context.filter((x) => x !== "remove") : context;
    }

    async _onContext(context: string): Promise<void> {
        switch (context) {
            case "copy-id": {
                game.clipboard.copyPlainText(this.trigger.id);
                return info(`${this.localizePath}.copied`);
            }

            default: {
                return super._onContext(context);
            }
        }
    }
}

export { ExecuteEventBlueprintNode };
