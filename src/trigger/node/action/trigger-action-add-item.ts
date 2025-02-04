import { addItemSchema } from "schema/action/schema-action-add-item";
import { TriggerNode } from "../trigger-node";
import { ActorPF2e, ItemPF2e, ItemType } from "module-helpers";

class AddItemTriggerAction extends TriggerNode<typeof addItemSchema> {
    async execute(): Promise<void> {
        const target = (await this.get("target")) ?? this.target;
        const item = await this.get("item");

        if (!item) {
            return this.send("out");
        }

        const duplicates = !!(await this.get("duplicate"));
        const maxTakable = !duplicates ? 1 : item.isOfType("feat") ? item.maxTakable : Infinity;

        if (maxTakable !== Infinity) {
            const uuid = item.sourceId ?? item.uuid;
            const exist: ItemPF2e<ActorPF2e>[] = [];
            const items = target.actor.itemTypes[item.type as ItemType];

            for (const found of items) {
                if (found.sourceId !== uuid) continue;
                exist.push(found);
            }

            if (exist.length >= maxTakable) {
                return this.send("out");
            }
        }

        const source = item.toObject();
        const [created] = await this.options.this.actor.createEmbeddedDocuments("Item", [source]);

        this.setVariable("item", created);
        return this.send("out");
    }
}

export { AddItemTriggerAction };
