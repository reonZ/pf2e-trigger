import { R, getExtraRollOptions, rollDamageFromFormula } from "module-helpers";
import { rollDamageSchema } from "schema/action/schema-roll-damage";
import { TriggerNode } from "../trigger-node";

class RollDamageTriggerNode extends TriggerNode<typeof rollDamageSchema> {
    protected async _execute(target: TargetDocuments) {
        const formula = await this.get("formula");
        if (!R.isString(formula) || !formula.trim()) return;

        const rollData = await this.get("roll");

        await rollDamageFromFormula(formula, {
            item: rollData?.item,
            target: (await this.get("target")) ?? this.options.this,
            origin: rollData?.origin,
            extraRollOptions: getExtraRollOptions(rollData),
        });

        return this.send("out", target);
    }
}

export { RollDamageTriggerNode };
