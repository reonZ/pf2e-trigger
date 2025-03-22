import { hasConditionSchema } from "schema/condition/schema-condition-has-condition";
import { TriggerNode } from "../trigger-node";
import { ConditionSlug } from "module-helpers";

class HasConditionTriggerCondition extends TriggerNode<typeof hasConditionSchema> {
    async execute(): Promise<void> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("false");
        }

        const slug = (await this.get("condition")) as ConditionSlug;

        const condition = slug ? actor.conditions.bySlug(slug)[0] : undefined;
        if (!condition) {
            return this.send("false");
        }

        const counter = (await this.get("counter")) || 1;
        const sendKey = (condition.value ?? 1) >= counter ? "true" : "false";

        return this.send(sendKey);
    }
}

export { HasConditionTriggerCondition };
