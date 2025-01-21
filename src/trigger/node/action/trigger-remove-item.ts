import { removeItemSchema } from "schema/action/schema-remove-item";
import { TriggerNode } from "../trigger-node";
import { TriggerExecuteOptions } from "trigger/trigger";
import { getItemWithSourceId } from "module-helpers";

class RemoveItemTriggerNode extends TriggerNode<typeof removeItemSchema> {
    protected async _execute(origin: TargetDocuments, options: TriggerExecuteOptions) {
        const item = await this.get("item");

        if (item) {
            const exist = getItemWithSourceId(origin.actor, item.uuid);
            await exist?.delete();
        }

        this.send("out", origin, options);
    }
}

export { RemoveItemTriggerNode };
