import { getItemFromUuid, ItemPF2e } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class ItemSourceTriggerNode extends TriggerNode<NodeSchemaOf<"value", "item-source">> {
    #cached: Maybe<ItemPF2e>;

    async query(): Promise<ItemPF2e | undefined> {
        if (this.#cached === undefined) {
            const uuid = await this.get("uuid");
            this.#cached = await getItemFromUuid(uuid);
        }

        return this.#cached ?? undefined;
    }
}

export { ItemSourceTriggerNode };
