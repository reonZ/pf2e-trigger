import { itemEventSchema } from "schema/event/schema-event-item";
import { TriggerNode } from "../trigger-node";

class ItemTriggerEvent extends TriggerNode<typeof itemEventSchema> {
    async execute() {
        const item = this.options.item;
        if (!item) return;

        const uuid = (await this.get("uuid")).trim();
        if (uuid && item.sourceId !== uuid) return;

        this.setVariable("item", item);
        return this.send("out");
    }
}

export { ItemTriggerEvent };
