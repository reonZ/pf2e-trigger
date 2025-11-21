import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class ExecuteScriptTriggerNode extends TriggerNode<NodeSchemaOf<"action", "execute-script">> {
    async execute(): Promise<boolean> {
        const code = await this.get("code");

        const target = this.target;
        const values = await this.getCustomInputs(true);

        try {
            const fn = new foundry.utils.AsyncFunction("actor", "token", "values", code);
            const returnedValues = await fn(
                target.actor,
                target.token?.object ?? undefined,
                values
            );

            this.setOutputValues(returnedValues);
        } catch {}

        return this.send("out");
    }
}

export { ExecuteScriptTriggerNode };
