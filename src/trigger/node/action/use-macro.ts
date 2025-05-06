import { isScriptMacro, MODULE, R } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class UseMacroTriggerNode extends TriggerNode<NodeSchemaOf<"action", "use-macro">> {
    async execute(): Promise<boolean> {
        const uuid = await this.get("uuid");
        const macro = await fromUuid(uuid);

        if (!isScriptMacro(macro)) {
            return this.send("out");
        }

        this.get("uuid");

        const target = this.target;
        const values = await Promise.all(
            this.customInputs.map(async (input) => this.get(input.key as never))
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

            const outputs = this.customOutputs;
            for (let i = 0; i < outputs.length; i++) {
                const value = returnedValues[i];
                if (R.isNullish(value)) continue;

                const output = outputs[i];

                if (this.isValidCustomEntry(output.type, value)) {
                    this.setVariable(output.key, value as never);
                }
            }
        } catch (error) {
            MODULE.error(`an error occured while processing the macro: ${macro.name}`, error);
        }

        return this.send("out");
    }
}

export { UseMacroTriggerNode };
