import { hasItemSchema } from "@schema/condition/has-item-schema";
import { TriggerExecuteOptions } from "@trigger/trigger";
import { isInstanceOf } from "module-helpers";
import { TriggerNode } from "../trigger-node";

class HasItemTriggerNode extends TriggerNode<typeof hasItemSchema> {
    protected async _execute(origin: TargetDocuments, options: TriggerExecuteOptions) {
        const value = await this.get("item", origin, options);
        const sendKey = isInstanceOf(value, "ItemPF2e") ? "true" : "false";
        this.send(sendKey, origin, options);
    }
}

export { HasItemTriggerNode };
