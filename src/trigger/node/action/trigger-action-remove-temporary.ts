import { removeTemporarySchema } from "schema/action/schema-action-remove-temporary";
import { TriggerNode } from "../trigger-node";
import { getTriggerSlug } from "helpers/helpers-effect";

class RemoveTemporaryTriggerNode extends TriggerNode<typeof removeTemporarySchema> {
    async execute(): Promise<void> {
        const slug = await this.get("slug");

        if (!slug?.trim()) {
            return this.send("out");
        }

        const triggerSlug = getTriggerSlug(this.trigger, slug);
        const target = (await this.get("target")) ?? this.target;
        const exist = target.actor.itemTypes.effect.find((item) => item.slug === triggerSlug);

        await exist?.delete();

        return this.send("out");
    }
}

export { RemoveTemporaryTriggerNode };
