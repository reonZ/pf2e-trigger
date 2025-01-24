import { hasRollOption } from "module-helpers";
import { hasOptionSchema } from "schema/condition/schema-has-option";
import { TriggerNode } from "../trigger-node";

class HasOptionTriggerNode extends TriggerNode<typeof hasOptionSchema> {
    protected async _execute(target: TargetDocuments) {
        const option = await this.get("option");
        const sendKey = hasRollOption(target.actor, option) ? "true" : "false";

        return this.send(sendKey, target);
    }
}

export { HasOptionTriggerNode };
