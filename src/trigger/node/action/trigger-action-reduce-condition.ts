import { ConditionSlug, R } from "module-helpers";
import { reduceConditionSchema } from "schema/action/schema-action-reduce-condition";
import { TriggerNode } from "../trigger-node";

class ReduceConditionTriggerNode extends TriggerNode<typeof reduceConditionSchema> {
    async execute(): Promise<void> {
        const slug = (await this.get("condition")) as ConditionSlug;
        const actor = (await this.get("target"))?.actor ?? this.target.actor;
        const condition = actor.conditions.bySlug(slug).find((condition) => !condition.isLocked);
        const current = condition?.system.value.value;
        const min = (await this.get("min")) ?? 0;

        if (!condition || !R.isNumber(current) || current <= min) {
            return this.send("out");
        }

        const reduction = (await this.get("value")) ?? 1;
        const newValue = Math.max(current - reduction, min);

        if (newValue > 0) {
            await game.pf2e.ConditionManager.updateConditionValue(condition.id, actor, newValue);
        } else {
            await actor.deleteEmbeddedDocuments("Item", [condition.id]);
        }

        return this.send("out");
    }
}

export { ReduceConditionTriggerNode };
