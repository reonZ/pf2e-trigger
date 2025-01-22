import { runMacroSchema } from "schema/action/schema-run-macro";
import { TriggerNode } from "../trigger-node";
import { TriggerExecuteOptions } from "trigger/trigger";

class RunMacroTriggerNode extends TriggerNode<typeof runMacroSchema> {
    protected async _execute(origin: TargetDocuments, options: TriggerExecuteOptions) {
        const macro = await this.get("macro");
        if (!macro) return;

        const result = await macro.execute({
            actor: origin.actor,
            token: origin.token?.object ?? undefined,
            options,
        });

        const sendKey = result === false ? "false" : "true";
        this.send(sendKey, origin, options);
    }
}

export { RunMacroTriggerNode };
