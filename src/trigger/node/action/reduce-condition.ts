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
        const counter = await this.get("counter");
        const min = await this.get("min");
        const toDelete: string[] = [];

        const conditions = actor.itemTypes.condition.filter(
            (condition) => condition.slug === slug && !condition.isLocked
        );

        // we decrease all the non-locked condition up to min value or delete the ones reaching 0
        for (const condition of conditions) {
            const current = condition.system.value.value;
            if (!R.isNumber(current) || current <= min) continue;

            const value = Math.max(current - counter, min);

            if (value > 0) {
                await game.pf2e.ConditionManager.updateConditionValue(condition.id, actor, value);
            } else {
                toDelete.push(condition.id);
            }
        }

        if (toDelete.length) {
            await actor.deleteEmbeddedDocuments("Item", toDelete);
        }

        return this.send("out");
    }
}

export { ReduceConditionTriggerNode };
