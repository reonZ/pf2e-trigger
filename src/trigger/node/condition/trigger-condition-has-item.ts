import { hasItemSchema } from "schema/condition/schema-condition-has-item";
import { TriggerNode } from "../trigger-node";

class HasItemTriggerCondition extends TriggerNode<typeof hasItemSchema> {
    async execute(): Promise<void> {
        const target = await this.getTarget("target");

        if (!target) {
            return this.send("false");
        }

        const item = this.getExistingItem(target, await this.get("item"));

        if (item) {
            this.setVariable("item", item);
            return this.send("true");
        } else {
            return this.send("false");
        }
    }
}

export { HasItemTriggerCondition };
