import { ConditionSlug } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class HasConditionTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "has-condition">> {
    async execute(): Promise<boolean> {
        const slug = (await this.get("condition")) as ConditionSlug;
        const counter = await this.get("counter");
        const actor = await this.getTargetActor("target");

        const condition = actor?.conditions.bySlug(slug)?.[0];
        const sendKey = !!condition && (condition.value ?? 1) >= counter;

        return this.send(sendKey);
    }
}

export { HasConditionTriggerNode };
