import { hasItemSchema } from "schema/condition/schema-has-item";
import { TriggerExecuteOptions } from "trigger/trigger";
import { hasItemWithSourceId } from "module-helpers";
import { TriggerNode } from "../trigger-node";

class HasItemTriggerNode extends TriggerNode<typeof hasItemSchema> {
    protected async _execute(origin: TargetDocuments, options: TriggerExecuteOptions) {
        const item = await this.get("item");
        const hasItem = item ? hasItemWithSourceId(origin.actor, item.uuid) : false;
        const sendKey = hasItem ? "true" : "false";

        this.send(sendKey, origin, options);
    }
}

export { HasItemTriggerNode };
