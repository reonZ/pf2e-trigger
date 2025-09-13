import { findAllItemsWithSlug } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class RemoveItemWithSlugTriggerNode extends TriggerNode<
    NodeSchemaOf<"action", "remove-item-slug">
> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const slug = await this.get("slug");
        const ids = findAllItemsWithSlug(actor, slug).map((item) => item.id);

        if (ids.length) {
            await actor.deleteEmbeddedDocuments("Item", ids);
        }

        return this.send("out");
    }
}

export { RemoveItemWithSlugTriggerNode };
