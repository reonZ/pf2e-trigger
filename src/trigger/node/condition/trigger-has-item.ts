import { hasItemWithSourceId } from "module-helpers";
import { hasItemSchema } from "schema/condition/schema-has-item";
import { TriggerNode } from "../trigger-node";

class HasItemTriggerNode extends TriggerNode<typeof hasItemSchema> {
    protected async _execute(target: TargetDocuments) {
        const item = await this.get("item");
        const hasItem = item ? hasItemWithSourceId(target.actor, item.uuid) : false;
        const sendKey = hasItem ? "true" : "false";

        return this.send(sendKey, target);
    }
}

export { HasItemTriggerNode };
