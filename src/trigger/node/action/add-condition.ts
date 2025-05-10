import { ConditionSlug, createCustomCondition } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class AddConditionTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-condition">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const effect = createCustomCondition({
            ...(await this.get("effect")),
            slug: (await this.get("condition")) as ConditionSlug,
            counter: await this.get("counter"),
        });

        if (effect) {
            await actor.createEmbeddedDocuments("Item", [effect]);
        }

        return this.send("out");
    }
}

export { AddConditionTriggerNode };
