import { createCustomEffect, imagePath } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { getEffectData, getTemporaryIdentifier, TriggerNode } from "trigger";

class AddTemporaryTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-temporary">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const { identifier, slug } = await getTemporaryIdentifier(this);
        const effect = createCustomEffect({
            ...(await getEffectData(this)),
            img: imagePath("clockwork", "svg"),
            name: `${this.trigger.label} (${identifier})`,
            slug,
        });

        if (effect) {
            await actor.createEmbeddedDocuments("Item", [effect]);
        }

        return this.send("out");
    }
}

export { AddTemporaryTriggerNode };
