import { hasRollOption } from "module-helpers";
import { TriggerNode } from "../trigger-node";
import { hasOptionsSchema } from "schema/condition/schema-condition-has-option";

class HasOptionTriggerCondition extends TriggerNode<typeof hasOptionsSchema> {
    async execute(): Promise<void> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("false");
        }

        const option = await this.get("option");
        const sendKey = !!option?.trim() && hasRollOption(actor, option) ? "true" : "false";

        return this.send(sendKey);
    }
}

export { HasOptionTriggerCondition };
