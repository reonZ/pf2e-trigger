import { ItemPF2e } from "module-helpers";
import { TriggerNode } from "../trigger-node";

class ItemSourceTriggerValue extends TriggerNode {
    #cached: ItemPF2e | undefined = undefined;

    async query(key: string): Promise<ItemPF2e | undefined> {
        if (!this.#cached) {
            const uuid = (await this.get("uuid")) as string;
            const item = uuid.trim() ? await fromUuid<ItemPF2e>(uuid) : null;

            if (item instanceof Item && item.pack) {
                this.#cached = item;
            } else {
                return item ?? undefined;
            }
        }

        return this.#cached;
    }
}

export { ItemSourceTriggerValue };
