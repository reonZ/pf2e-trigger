import { getItemFromUuid, ItemPF2e } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class ItemSourceTriggerNode extends TriggerNode<NodeSchemaOf<"value", "item-source">> {
    #cached: Maybe<ItemPF2e>;

    async query(): Promise<Maybe<ItemPF2e>> {
        if (this.#cached !== undefined) {
            return this.#cached;
        }

        const uuid = await this.get("uuid");
        return (this.#cached = await getItemFromUuid(uuid));
    }
}

export { ItemSourceTriggerNode };
