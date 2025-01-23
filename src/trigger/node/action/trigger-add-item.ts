import { ActorPF2e, ItemPF2e, ItemType } from "module-helpers";
import { addItemSchema } from "schema/action/schema-add-item";
import { TriggerExecuteOptions } from "trigger/trigger";
import { TriggerNode } from "../trigger-node";

class AddItemTriggerNode extends TriggerNode<typeof addItemSchema> {
    protected async _execute(origin: TargetDocuments, options: TriggerExecuteOptions) {
        const item = await this.get("item");
        if (!item) return;

        const duplicates = await this.get("duplicate");
        const maxTakable = !duplicates ? 1 : item.isOfType("feat") ? item.maxTakable : Infinity;

        if (maxTakable !== Infinity) {
            const uuid = item.uuid;
            const exist: ItemPF2e<ActorPF2e>[] = [];

            const items = options.target.actor.itemTypes[item.type as ItemType];
            for (const found of items) {
                const sourceId = found.sourceId;
                if (sourceId !== uuid) continue;
                exist.push(found);
            }

            if (exist.length >= maxTakable) {
                return this.send("out", origin, options);
            }
        }

        const source = item.toObject();
        await options.target.actor.createEmbeddedDocuments("Item", [source]);

        this.send("out", origin, options);
    }
}

export { AddItemTriggerNode };
