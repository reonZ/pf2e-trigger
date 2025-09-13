import { findAllItemsWithSourceId } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class RemoveItemTriggerNode extends TriggerNode<NodeSchemaOf<"action", "remove-item">> {
    async execute(): Promise<boolean> {
        const uuid = await this.get("uuid");
        const actor = await this.getTargetActor("target");

        if (!actor || !uuid) {
            return this.send("out");
        }

        const ids = findAllItemsWithSourceId(actor, uuid).map((item) => item.id);

        if (ids.length) {
            await actor.deleteEmbeddedDocuments("Item", ids);
        }

        return this.send("out");
    }
}

export { RemoveItemTriggerNode };
