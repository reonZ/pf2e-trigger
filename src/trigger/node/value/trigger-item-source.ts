import { ExtractSchemaInputsKeys } from "schema/schema";
import { itemSourceSchema } from "schema/value/schema-item-source";
import { ItemPF2e, R } from "module-helpers";
import { TriggerNode } from "../trigger-node";

class ItemSourceTriggerNode extends TriggerNode<typeof itemSourceSchema> {
    #cached: ItemPF2e | null | undefined = undefined;

    protected async _query(
        key: ExtractSchemaInputsKeys<typeof itemSourceSchema>
    ): Promise<ItemPF2e | undefined> {
        if (this.#cached === undefined) {
            const uuid = await this.get("uuid");
            const item = R.isString(uuid) && uuid.trim() ? await fromUuid<ItemPF2e>(uuid) : null;

            this.#cached = item instanceof Item ? item : null;
        }

        return this.#cached ?? undefined;
    }
}

export { ItemSourceTriggerNode };
