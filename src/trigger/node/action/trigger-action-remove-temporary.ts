import { removeTemporarySchema } from "schema/action/schema-action-remove-temporary";
import { TriggerNode } from "../trigger-node";
import { getTriggerSlug } from "helpers/helpers-effect";

class RemoveTemporaryTriggerNode extends TriggerNode<typeof removeTemporarySchema> {
    async execute(): Promise<void> {
        const slug = await this.get("slug");
        const actor = await this.getTargetActor("target");

        if (!actor || !slug?.trim()) {
            return this.send("out");
        }

        const triggerSlug = getTriggerSlug(this.trigger, slug);
        const exist = actor.itemTypes.effect.find((item) => item.slug === triggerSlug);

        await exist?.delete();

        return this.send("out");
    }
}

export { RemoveTemporaryTriggerNode };
