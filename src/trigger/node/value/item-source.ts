import { ItemPF2e } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class ItemSourceTriggerNode extends TriggerNode<NodeSchemaOf<"value", "item-source">> {
    async query<K extends "item">(key: K): Promise<ItemPF2e | undefined> {
        const uuid = await this.get("uuid");
        const item = await fromUuid<ItemPF2e>(uuid);
        return item instanceof Item ? item : undefined;
    }
}

export { ItemSourceTriggerNode };
