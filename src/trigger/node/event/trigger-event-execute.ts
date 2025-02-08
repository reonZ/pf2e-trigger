import { isValidCustomEntry } from "data/data-entry";
import { R } from "module-helpers";
import { TriggerNode } from "../trigger-node";

class ExecuteTriggerEvent extends TriggerNode {
    async execute() {
        const values = this.options.values ?? [];
        const outputs = this.custom.outputs as NodeSchemaVariable[];

        for (let i = 0; i < outputs.length; i++) {
            const value = values[i];
            if (R.isNullish(value)) continue;

            const output = outputs[i];

            if (isValidCustomEntry(output.type, value)) {
                this.setVariable(output.key, value as any);
            }
        }

        return this.send("out");
    }
}

export { ExecuteTriggerEvent };
