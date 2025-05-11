import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class DeleteItemTriggerNode extends TriggerNode<NodeSchemaOf<"action", "delete-item">> {
    async execute(): Promise<boolean> {
        const item = await this.get("item");

        if (item?.actor && !item.pack) {
            await item.delete();
        }

        return this.send("out");
    }
}

export { DeleteItemTriggerNode };
