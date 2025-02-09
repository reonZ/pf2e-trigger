import { executeEffect, getTriggerSlug } from "helpers/helpers-effect";
import { imagePath, localize } from "module-helpers";
import { addTemporarySchema } from "schema/action/schema-action-add-temporary";
import { TriggerNode } from "../trigger-node";

class AddTemporaryTriggerNode extends TriggerNode<typeof addTemporarySchema> {
    async execute(): Promise<void> {
        const slug = await this.get("slug");

        if (!slug?.trim()) {
            return this.send("out");
        }

        const target = (await this.get("target")) ?? this.target;

        executeEffect(this, target.actor, null, async () => {
            const title = localize(this.localizePath, "effect");

            return {
                name: `${title} (${slug})`,
                img: imagePath("clockwork", "svg"),
                slug: getTriggerSlug(this.trigger, slug),
            };
        });

        return this.send("out");
    }
}

export { AddTemporaryTriggerNode };
