import { TriggerNode } from "../trigger-node";

class TriggerSetter extends TriggerNode {
    async execute(): Promise<void> {
        const entryId = this.data.inputs.input.ids?.[0];
        const key = this.custom.inputs[0]?.key;

        if (key && entryId) {
            this.options.variables[entryId] = await this.get(key);
        }

        return this.send("out");
    }
}

export { TriggerSetter };
