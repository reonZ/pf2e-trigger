import { getTriggerOption } from "helpers/helpers-effect";
import { hasTemporarySchema } from "schema/condition/schema-condition-has-temporary";
import { TriggerNode } from "../trigger-node";
import { hasRollOption } from "module-helpers";

class HasTemporaryTriggerCondition extends TriggerNode<typeof hasTemporarySchema> {
    async execute(): Promise<void> {
        const slug = await this.get("slug");
        const actor = await this.getTargetActor("target");

        if (!actor || !slug?.trim()) {
            return this.send("false");
        }

        const triggerOption = getTriggerOption(this.trigger, slug);
        const sendKey = hasRollOption(actor, triggerOption) ? "true" : "false";

        return this.send(sendKey);
    }
}

export { HasTemporaryTriggerCondition };
