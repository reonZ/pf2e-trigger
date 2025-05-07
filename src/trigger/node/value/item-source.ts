import { getItemFromUuid, ItemPF2e } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class ItemSourceTriggerNode extends TriggerNode<NodeSchemaOf<"value", "item-source">> {
    async query(): Promise<ItemPF2e | undefined> {
        const uuid = await this.get("uuid");
        return getItemFromUuid(uuid);
    }
}

export { ItemSourceTriggerNode };
