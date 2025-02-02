import { getItemWithSourceId } from "module-helpers";
import { hasItemSchema } from "schema/condition/schema-has-item";
import { TriggerNode } from "../trigger-node";

class HasItemTriggerNode extends TriggerNode<typeof hasItemSchema> {
    protected async _execute(target: TargetDocuments) {
        const item = await this.get("item");
        const hasItem = item ? getItemWithSourceId(target.actor, item.uuid) : false;

        if (hasItem) {
            this.setVariable("has-item", hasItem);
            return this.send("true", target);
        } else {
            return this.send("false", target);
        }
    }
}

export { HasItemTriggerNode };
