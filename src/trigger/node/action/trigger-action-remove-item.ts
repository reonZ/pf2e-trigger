import { removeItemSchema } from "schema/action/schema-action-remove-item";
import { TriggerNode } from "../trigger-node";

class RemoveItemTriggerAction extends TriggerNode<typeof removeItemSchema> {
    async execute(): Promise<void> {
        const target = (await this.get("target")) ?? this.target;
        const item = this.getExistingItem(target, await this.get("item"));

        await item?.delete();

        return this.send("out");
    }
}

export { RemoveItemTriggerAction };
