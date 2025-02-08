import { BlueprintEntry } from "blueprint/entry/blueprint-entry";
import { makeCustomNode } from "../blueprint-node-custom";
import { ActionBlueprintNode } from "./blueprint-action";

class AddImmunityBlueprintNode extends makeCustomNode(ActionBlueprintNode) {
    get icon(): string {
        return "\uf644";
    }

    get context() {
        return ["add-exception", ...super.context];
    }

    getConnectionContext(entry: BlueprintEntry): string[] {
        const context = super.getConnectionContext(entry);
        return ["type", "target"].includes(entry.key)
            ? context.filter((x) => x !== "remove")
            : context;
    }

    async _onContext(context: string): Promise<void> {
        switch (context) {
            case "add-exception": {
                this.#addException();
                return;
            }

            default: {
                return super._onContext(context);
            }
        }
    }

    #addException() {
        const entries = this.data.custom.inputs;

        entries.push({
            key: fu.randomID(),
            type: "select",
            field: {
                options: "CONFIG.PF2E.immunityTypes",
            },
        });

        this.refresh(true);
    }
}

export { AddImmunityBlueprintNode };
