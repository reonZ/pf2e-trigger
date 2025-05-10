import { findItemWithSourceId, getItemSourceId } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class RemoveItemTriggerNode extends TriggerNode<NodeSchemaOf<"action", "remove-item">> {
    async execute(): Promise<boolean> {
        const item = await this.get("item");
        const actor = await this.getTargetActor("target");

        if (!actor || !item) {
            return this.send("out");
        }

        const exist =
            item.actor === actor ? item : findItemWithSourceId(actor, getItemSourceId(item));

        await exist?.delete();
        return this.send("out");
    }
}

export { RemoveItemTriggerNode };
