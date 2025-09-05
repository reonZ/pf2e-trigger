import { ConditionSlug, R } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class RemoveConditionTriggerNode extends TriggerNode<NodeSchemaOf<"action", "remove-condition">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const slug = (await this.get("condition")) as ConditionSlug;
        const toDelete = R.pipe(
            actor.itemTypes.condition,
            R.filter((condition) => condition.slug === slug && !condition.isLocked),
            R.map(({ id }) => id)
        );

        if (toDelete.length) {
            await actor.deleteEmbeddedDocuments("Item", toDelete);
        }

        return this.send("out");
    }
}

export { RemoveConditionTriggerNode };
