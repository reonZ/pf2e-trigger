import { createCustomEffect, imagePath } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";
import { getEffectData } from "./_utils";

class AddTemporaryTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-temporary">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const identifier = (await this.get("identifier")) || "temporary";
        const effect = createCustomEffect({
            ...(await getEffectData(this)),
            img: imagePath("clockwork", "svg"),
            name: `${this.trigger.label} (${identifier})`,
            slug: game.pf2e.system.sluggify(`${this.trigger.id}-${identifier}`),
        });

        if (effect) {
            await actor.createEmbeddedDocuments("Item", [effect]);
        }

        return this.send("out");
    }
}

export { AddTemporaryTriggerNode };
