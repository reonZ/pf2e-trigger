import { ActorPF2e, ItemPF2e, ItemType } from "module-helpers";
import { addItemSchema } from "schema/action/schema-add-item";
import { TriggerNode } from "../trigger-node";

class AddItemTriggerNode extends TriggerNode<typeof addItemSchema> {
    protected async _execute(target: TargetDocuments) {
        const item = await this.get("item");
        if (!item) return;

        const duplicates = await this.get("duplicate");
        const maxTakable = !duplicates ? 1 : item.isOfType("feat") ? item.maxTakable : Infinity;

        if (maxTakable !== Infinity) {
            const uuid = item.uuid;
            const exist: ItemPF2e<ActorPF2e>[] = [];

            const items = this.options.this.actor.itemTypes[item.type as ItemType];
            for (const found of items) {
                const sourceId = found.sourceId;
                if (sourceId !== uuid) continue;
                exist.push(found);
            }

            if (exist.length >= maxTakable) {
                return this.send("out", target);
            }
        }

        const source = item.toObject();
        await this.options.this.actor.createEmbeddedDocuments("Item", [source]);

        return this.send("out", target);
    }
}

export { AddItemTriggerNode };
