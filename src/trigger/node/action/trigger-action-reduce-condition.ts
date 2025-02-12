import { ConditionSlug, R } from "module-helpers";
import { reduceConditionSchema } from "schema/action/schema-action-reduce-condition";
import { TriggerNode } from "../trigger-node";

class ReduceConditionTriggerNode extends TriggerNode<typeof reduceConditionSchema> {
    async execute(): Promise<void> {
        const min = (await this.get("min")) ?? 0;
        const reduction = (await this.get("value")) ?? 1;
        const slug = (await this.get("condition")) as ConditionSlug;
        const actor = (await this.get("target"))?.actor ?? this.target.actor;
        const conditions = actor.conditions.bySlug(slug).filter((condition) => !condition.isLocked);

        const toDelete: string[] = [];
        const toUpdate: { id: string; value: number }[] = [];

        for (const condition of conditions) {
            const current = condition?.system.value.value;
            if (!R.isNumber(current) || current <= min) continue;

            const newValue = Math.max(current - reduction, min);

            if (newValue > 0) {
                toUpdate.push({ id: condition.id, value: newValue });
            } else {
                toDelete.push(condition.id);
            }
        }

        for (const { id, value } of toUpdate) {
            await game.pf2e.ConditionManager.updateConditionValue(id, actor, value);
        }

        if (toDelete.length) {
            await actor.deleteEmbeddedDocuments("Item", toDelete);
        }

        return this.send("out");
    }
}

export { ReduceConditionTriggerNode };
