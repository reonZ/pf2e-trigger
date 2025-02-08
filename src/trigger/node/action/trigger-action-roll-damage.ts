import { R, getExtraRollOptions, rollDamageFromFormula } from "module-helpers";
import { TriggerNode } from "../trigger-node";
import { rollDamageSchema } from "schema/action/schema-action-roll-damage";

class RollDamageTriggerAction extends TriggerNode<typeof rollDamageSchema> {
    async execute(): Promise<void> {
        const formula = await this.get("formula");

        if (!R.isString(formula) || !formula.trim()) {
            return this.send("out");
        }

        const rollData = await this.get("roll");

        await rollDamageFromFormula(formula, {
            item: rollData?.item,
            target: (await this.get("target")) ?? this.options.this,
            origin: rollData?.origin,
            extraRollOptions: getExtraRollOptions(rollData),
            skipDialog: true,
        });

        return this.send("out");
    }
}

export { RollDamageTriggerAction };
