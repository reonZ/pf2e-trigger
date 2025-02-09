import { BlueprintEntry } from "blueprint/entry/blueprint-entry";
import { makeCustomNode } from "blueprint/node/blueprint-node-custom";
import { ActionBlueprintNode } from "../blueprint-action";
import { R } from "module-helpers";

abstract class AddIwrBlueprintNode extends makeCustomNode(ActionBlueprintNode) {
    abstract get iwrConfig(): IwrConfig;

    get context() {
        return ["add-exception", ...super.context];
    }

    get schema(): NodeSchema {
        const schema = super.schema;

        const [exceptions, withoutExceptions] = R.partition(
            schema.inputs as NodeSchemaInput[],
            (input) => input.key.endsWith("-exception")
        );

        if (!exceptions.length) {
            return schema;
        }

        const inputs: NodeSchemaInput[] = [
            ...withoutExceptions,
            {
                key: "exceptions",
                type: "label",
                label: "PF2E.Actor.IWREditor.Exceptions",
            },
            ...exceptions,
        ];

        return {
            ...schema,
            inputs,
        };
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
            key: `${fu.randomID()}-exception`,
            type: "select",
            field: {
                options: this.iwrConfig,
            },
        });

        this.refresh(true);
    }
}

export { AddIwrBlueprintNode };
