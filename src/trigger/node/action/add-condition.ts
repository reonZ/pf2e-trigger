import { createCustomCondition } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { getEffectData, TriggerNode } from "trigger";

class AddConditionTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-condition">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const effect = createCustomCondition({
            ...(await getEffectData(this)),
            slug: await this.get("condition"),
            counter: await this.get("counter"),
            name: await this.get("label"),
        });

        if (effect) {
            await actor.createEmbeddedDocuments("Item", [effect]);
        }

        return this.send("out");
    }
}

export { AddConditionTriggerNode };
