import { effectDurationSchema } from "schema/action/schema-action-effect-duration";
import { TriggerNode } from "../trigger-node";

class EffectDurationTriggerNode extends TriggerNode<typeof effectDurationSchema> {
    async execute(): Promise<void> {
        const value = await this.get("value");
        const item = await this.get("effect");

        console.log({ value, item });

        if (
            value === 0 ||
            !item?.isOfType("effect") ||
            !item.actor ||
            item.system.duration.expiry == null
        ) {
            return this.send("out");
        }

        const remaining = item.system.duration.value + value;
        const mustDelete = remaining <= 0;

        if (mustDelete) {
            await item.delete();
        } else {
            await item.update({ "system.duration.value": remaining });
        }

        this.setVariable("removed", mustDelete);

        return this.send("out");
    }
}

export { EffectDurationTriggerNode };
