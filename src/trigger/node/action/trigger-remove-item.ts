import { getItemWithSourceId } from "module-helpers";
import { removeItemSchema } from "schema/action/schema-remove-item";
import { TriggerNode } from "../trigger-node";

class RemoveItemTriggerNode extends TriggerNode<typeof removeItemSchema> {
    protected async _execute(target: TargetDocuments) {
        const item = await this.get("item");
        if (!item) return;

        const exist = getItemWithSourceId(this.options.this.actor, item.uuid);
        await exist?.delete();

        return this.send("out", target);
    }
}

export { RemoveItemTriggerNode };
