import { createCustomEffect, imagePath } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { getEffectData, getTemporaryIdentifier, TriggerNode } from "trigger";

class AddTemporaryTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-temporary">> {
    async execute(): Promise<boolean> {
        const data = await getEffectData(this);

        if (!data) {
            return this.send("out");
        }

        const image = (await this.get("image")) as ImageFilePath;
        const { identifier, slug } = await getTemporaryIdentifier(this);
        const effect = createCustomEffect({
            ...data,
            img: image || imagePath("clockwork", "svg"),
            name: data.name || `${this.trigger.label} (${identifier})`,
            slug,
        });

        if (effect) {
            await data.actor.createEmbeddedDocuments("Item", [effect]);
        }

        return this.send("out");
    }
}

export { AddTemporaryTriggerNode };
