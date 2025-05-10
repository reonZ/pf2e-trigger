import { ConditionSlug, createCustomCondition } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { getEffectData, TriggerNode } from "trigger";

class AddConditionTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-condition">> {
    async execute(): Promise<boolean> {
        const data = await getEffectData(this);

        if (!data) {
            return this.send("out");
        }

        const effect = createCustomCondition({
            ...data,
            slug: (await this.get("condition")) as ConditionSlug,
            counter: await this.get("counter"),
        });

        if (effect) {
            await data.actor.createEmbeddedDocuments("Item", [effect]);
        }

        return this.send("out");
    }
}

export { AddConditionTriggerNode };
