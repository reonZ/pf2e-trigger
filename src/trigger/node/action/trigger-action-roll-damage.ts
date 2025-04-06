import { RollDamageExtraOptions, getExtraRollOptions, rollDamageFromFormula } from "module-helpers";
import { rollDamageSchema } from "schema/action/schema-action-roll-damage";
import { TriggerNode } from "../trigger-node";

class RollDamageTriggerAction extends TriggerNode<typeof rollDamageSchema> {
    async execute(): Promise<void> {
        const [formula, data] = (await getDamageData(this)) ?? [];

        if (formula) {
            await rollDamageFromFormula(formula, data);
        }

        return this.send("out");
    }
}

async function getDamageData(
    trigger: TriggerNode<typeof rollDamageSchema>
): Promise<[string, DamageData] | null> {
    const formula = await trigger.get("formula");
    const target = await trigger.getTarget("target");
    if (!target || !formula.trim()) return null;

    const rollData = await trigger.get("roll");

    return [
        formula,
        {
            target,
            item: rollData?.item,
            origin: rollData?.origin,
            extraRollOptions: getExtraRollOptions(rollData),
            skipDialog: true,
        },
    ];
}

type DamageData = WithRequired<RollDamageExtraOptions, "target" | "extraRollOptions">;

export { RollDamageTriggerAction, getDamageData };
