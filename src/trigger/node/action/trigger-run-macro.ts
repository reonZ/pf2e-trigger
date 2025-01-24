import { runMacroSchema } from "schema/action/schema-run-macro";
import { TriggerNode } from "../trigger-node";

class RunMacroTriggerNode extends TriggerNode<typeof runMacroSchema> {
    protected async _execute(target: TargetDocuments) {
        const macro = await this.get("macro");
        if (!macro) return;

        const options = this.options;

        const result = await macro.execute({
            actor: options.this.actor,
            token: options.this.token?.object ?? undefined,
            options,
        });

        const sendKey = result === false ? "false" : "true";
        return this.send(sendKey, target);
    }
}

export { RunMacroTriggerNode };
