import { createCustomEffect, imagePath } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { getTemporaryIdentifier, TriggerNode } from "trigger";

class AddTemporaryTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-temporary">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const data = await this.get("effect");
        const { identifier, slug } = await getTemporaryIdentifier(this);
        const effect = createCustomEffect({
            ...data,
            img: data.img || imagePath("clockwork", "svg"),
            name: data.name || `${this.trigger.label} (${identifier})`,
            slug,
        });

        if (effect) {
            await actor.createEmbeddedDocuments("Item", [effect]);
        }

        return this.send("out");
    }
}

export { AddTemporaryTriggerNode };
