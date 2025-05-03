import { NodeEntryType } from "data";
import { isScriptMacro, MODULE, R } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class UseMacroTriggerNode extends TriggerNode<UseMacroSchema> {
    async execute(): Promise<boolean> {
        const uuid = await this.get("uuid");
        const macro = await fromUuid(uuid);

        if (!isScriptMacro(macro)) {
            return this.send("out");
        }

        this.get("uuid");

        const target = this.target;
        const values = await Promise.all(
            this.inputs.map(async (input) => this.get(input.key as never))
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

            const outputs = this.outputs;
            for (let i = 0; i < outputs.length; i++) {
                const value = returnedValues[i];
                if (R.isNullish(value)) continue;

                const output = outputs[i];

                if (isValidCustomEntry(output.type, value)) {
                    this.setVariable(output.key, value as never);
                }
            }
        } catch (error) {
            MODULE.error(`an error occured while processing the macro: ${macro.name}`, error);
        }

        return this.send("out");
    }
}

function isValidCustomEntry(type: NodeEntryType, value: unknown) {
    switch (type) {
        case "number": {
            return R.isNumber(value);
        }

        case "boolean": {
            return R.isBoolean(value);
        }

        case "text": {
            return R.isString(value);
        }

        case "item": {
            return value instanceof Item;
        }

        case "target": {
            return (
                R.isPlainObject(value) &&
                value.actor instanceof Actor &&
                (!value.token || value.token instanceof TokenDocument)
            );
        }

        case "list": {
            return R.isArray(value) && value.every(R.isString);
        }

        case "dc": {
            // TODO
            return R.isPlainObject(value);
        }

        case "duration": {
            // TODO
            return R.isPlainObject(value);
        }

        default: {
            return false;
        }
    }
}

type UseMacroSchema = NodeSchemaOf<"action", "use-macro">;

export { UseMacroTriggerNode };
