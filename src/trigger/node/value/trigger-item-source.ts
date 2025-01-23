import { ExtractSchemaInputsKeys } from "schema/schema";
import { itemSourceSchema } from "schema/value/schema-item-source";
import { ItemPF2e, R } from "module-helpers";
import { TriggerNode } from "../trigger-node";

class ItemSourceTriggerNode extends TriggerNode<typeof itemSourceSchema> {
    #cached: ItemPF2e | undefined = undefined;

    protected async _query(
        key: ExtractSchemaInputsKeys<typeof itemSourceSchema>
    ): Promise<ItemPF2e | undefined> {
        if (!this.#cached) {
            const uuid = await this.get("uuid");
            const item = R.isString(uuid) && uuid.trim() ? await fromUuid<ItemPF2e>(uuid) : null;

            if (item instanceof Item && item.pack) {
                this.#cached = item;
            } else {
                return item ?? undefined;
            }
        }

        return this.#cached;
    }
}

export { ItemSourceTriggerNode };
