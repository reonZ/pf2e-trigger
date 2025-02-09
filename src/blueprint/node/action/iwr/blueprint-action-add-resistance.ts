import { R } from "module-helpers";
import { AddIwrBlueprintNode } from "./blueprint-action-add-iwr";

class AddResistanceBlueprintNode extends AddIwrBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\uf7a9", { fontWeight: "900" });
    }

    get iwrConfig(): IwrConfig {
        return "CONFIG.PF2E.resistanceTypes";
    }

    get context() {
        const context = super.context;
        context.splice(1, 0, "add-double");
        return context;
    }

    get schema(): NodeSchema {
        const schema = super.schema;

        const [doubles, withoutDoubles] = R.partition(schema.inputs as NodeSchemaInput[], (input) =>
            input.key.endsWith("-double")
        );

        if (!doubles.length) {
            return schema;
        }

        const inputs: NodeSchemaInput[] = [
            ...withoutDoubles,
            {
                key: "doubles",
                type: "label",
                label: "PF2E.Actor.IWREditor.DoubleVs",
            },
            ...doubles,
        ];

        return {
            ...schema,
            inputs,
        };
    }

    async _onContext(context: string): Promise<void> {
        switch (context) {
            case "add-double": {
                this.#addDouble();
                return;
            }

            default: {
                return super._onContext(context);
            }
        }
    }

    #addDouble() {
        const entries = this.data.custom.inputs;

        entries.push({
            key: `${fu.randomID()}-double`,
            type: "select",
            field: {
                options: this.iwrConfig,
            },
        });

        this.refresh(true);
    }
}

export { AddResistanceBlueprintNode };
