import { conditionEventSchema } from "schema/event/schema-event-condition";
import { TriggerNode } from "../trigger-node";

class ConditionTriggerEvent extends TriggerNode<typeof conditionEventSchema> {
    async execute() {
        const option = this.options.condition;
        if (!option) return;

        const condition = await this.get("condition");
        if (condition !== option.slug) return;

        const update = await this.get("update");
        if (!update && option.update) return;

        return this.send("out");
    }
}

export { ConditionTriggerEvent };
