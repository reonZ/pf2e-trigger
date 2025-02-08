import { getTriggerOption } from "helpers/helpers-effect";
import { hasTemporarySchema } from "schema/condition/schema-condition-has-temporary";
import { TriggerNode } from "../trigger-node";
import { hasRollOption } from "module-helpers";

class HasTemporaryTriggerCondition extends TriggerNode<typeof hasTemporarySchema> {
    async execute(): Promise<void> {
        const slug = await this.get("slug");

        if (!slug?.trim()) {
            return this.send("false");
        }

        const triggerOption = getTriggerOption(this.trigger, slug);
        const target = (await this.get("target")) ?? this.target;
        const sendKey = hasRollOption(target.actor, triggerOption) ? "true" : "false";

        return this.send(sendKey);
    }
}

export { HasTemporaryTriggerCondition };
