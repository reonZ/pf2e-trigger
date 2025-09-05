import {
    ConditionSlug,
    ConditionSource,
    createConditionSource,
    createCustomCondition,
    EffectSource,
    R,
} from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class AddConditionTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-condition">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const counter = await this.get("counter");
        const effect = await this.get("effect");
        const slug = (await this.get("condition")) as ConditionSlug;

        console.log(effect);

        const createConditionFromSource = async (
            source: Maybe<PreCreate<EffectSource | ConditionSource>>
        ): Promise<boolean> => {
            if (source) {
                await actor.createEmbeddedDocuments("Item", [source]);
            }

            return this.send("out");
        };

        // we are an effect+condition combo
        if (effect) {
            const source = createCustomCondition({ ...effect, slug, counter });
            return createConditionFromSource(source);
        }

        const conditions = actor.itemTypes.condition.filter(
            (condition) => condition.slug === slug && !condition.isLocked
        );

        // no condition currently exist so we create one
        if (!conditions.length) {
            const source = createConditionSource(slug, counter);
            return createConditionFromSource(source);
        }

        // we increase all non-locked conditions
        for (const condition of conditions) {
            const current = condition.system.value.value;
            if (!R.isNumber(current)) continue;

            const newValue = current + counter;

            await game.pf2e.ConditionManager.updateConditionValue(condition.id, actor, newValue);
        }

        return this.send("out");
    }
}

export { AddConditionTriggerNode };
