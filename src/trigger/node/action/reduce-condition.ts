import { ConditionSlug, R } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class ReduceConditionTriggerNode extends TriggerNode<NodeSchemaOf<"action", "reduce-condition">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const slug = (await this.get("condition")) as ConditionSlug;
        const value = await this.get("counter");
        const min = await this.get("min");
        const conditions = actor.conditions.bySlug(slug).filter((condition) => !condition.isLocked);

        const toDelete: string[] = [];
        const toUpdate: { id: string; value: number }[] = [];

        for (const condition of conditions) {
            const current = condition?.system.value.value;
            if (!R.isNumber(current) || current <= min) continue;

            const newValue = Math.max(current - value, min);

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
