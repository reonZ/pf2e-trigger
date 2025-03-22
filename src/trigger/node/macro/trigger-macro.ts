import { isValidCustomEntry } from "data/data-entry";
import { MODULE, MacroPF2e, R } from "module-helpers";
import { TriggerNode } from "../trigger-node";

class TriggerMacro extends TriggerNode {
    async execute(): Promise<void> {
        const uuid = (await this.get("uuid")) as string;

        if (!uuid.trim()) {
            return this.send("out");
        }

        const macro = await fromUuid<MacroPF2e>(uuid);

        if (!(macro instanceof Macro && macro.type === "script")) {
            return this.send("out");
        }

        const target = this.target;
        const values = await Promise.all(
            this.custom.inputs.map(async (input) => this.get(input.key))
        );

        try {
            const returnedValues = await macro.execute({
                actor: target.actor,
                token: target.token?.object ?? undefined,
                values,
            });

            if (!R.isArray(returnedValues)) {
                return this.send("out");
            }

            const outputs = this.custom.outputs as NodeSchemaVariable[];
            for (let i = 0; i < outputs.length; i++) {
                const value = returnedValues[i] as any;
                if (R.isNullish(value)) continue;

                const output = outputs[i];

                if (isValidCustomEntry(output.type, value)) {
                    this.setVariable(output.key, value as any);
                }
            }
        } catch (error) {
            MODULE.error(`an error occured while processing the macro: ${macro.name}`, error);
        }

        return this.send("out");
    }
}

export { TriggerMacro };
