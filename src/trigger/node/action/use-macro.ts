import { isScriptMacro } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class UseMacroTriggerNode extends TriggerNode<NodeSchemaOf<"action", "use-macro">> {
    async execute(): Promise<boolean> {
        const uuid = await this.get("uuid");
        const macro = await fromUuid(uuid);

        if (!isScriptMacro(macro)) {
            return this.send("out");
        }

        const target = this.target;
        const values = await this.getCustomInputs(true);

        const returnedValues = await macro.execute({
            actor: target.actor,
            token: target.token?.object ?? undefined,
            values,
        });

        this.setOutputValues(returnedValues);

        return this.send("out");
    }
}

export { UseMacroTriggerNode };
