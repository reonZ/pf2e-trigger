import { hasRollOption } from "module-helpers";
import { hasOptionSchema } from "schema/condition/schema-has-option";
import { TriggerExecuteOptions } from "trigger/trigger";
import { TriggerNode } from "../trigger-node";

class HasOptionTriggerNode extends TriggerNode<typeof hasOptionSchema> {
    protected async _execute(origin: TargetDocuments, options: TriggerExecuteOptions) {
        const option = await this.get("option");
        const sendKey = hasRollOption(origin.actor, option) ? "true" : "false";

        this.send(sendKey, origin, options);
    }
}

export { HasOptionTriggerNode };
