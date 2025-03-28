import { damageEventSchema } from "schema/event/schema-event-damage";
import { TriggerNode } from "../trigger-node";

class DamageTriggerEvent extends TriggerNode<typeof damageEventSchema> {
    async execute() {
        const other = this.options.other;
        const item = this.options.item;
        if (!other || !item) return;

        this.setVariable("other", other);
        this.setVariable("item", item);
        this.setVariable("heal", !!this.options.isHealing);
        this.setVariable("options", this.options.list ?? []);
        this.setVariable("negated", !!this.options.negated);

        return this.send("out");
    }
}

export { DamageTriggerEvent };
