import { getExtraRollOptions, rollDamageFromFormula } from "module-helpers";
import { rollDamageSchema } from "schema/action/schema-action-roll-damage";
import { TriggerNode } from "../trigger-node";

class RollDamageTriggerAction extends TriggerNode<typeof rollDamageSchema> {
    async execute(): Promise<void> {
        const formula = await this.get("formula");
        const target = await this.getTarget("target");

        if (!target || !formula.trim()) {
            return this.send("out");
        }

        const rollData = await this.get("roll");

        await rollDamageFromFormula(formula, {
            target,
            item: rollData?.item,
            origin: rollData?.origin,
            extraRollOptions: getExtraRollOptions(rollData),
            skipDialog: true,
        });

        return this.send("out");
    }
}

export { RollDamageTriggerAction };
