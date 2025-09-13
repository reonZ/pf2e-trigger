import { findItemWithSlug } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class HasItemWithSlugTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "has-item-slug">> {
    async execute(): Promise<boolean> {
        const target = await this.getTarget("target");

        if (!target) {
            return this.send("false");
        }

        const slug = await this.get("slug");
        const item = findItemWithSlug(target.actor, slug);

        if (item) {
            this.setVariable("item", item);
            return this.send("true");
        } else {
            return this.send("false");
        }
    }
}

export { HasItemWithSlugTriggerNode };
