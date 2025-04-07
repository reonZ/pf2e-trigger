import { rollDamageFromFormula } from "module-helpers";
import { toolbeltRollDamageSchema } from "schema/action/toolbelt/schema-action-toolbelt-roll-damage";
import { TriggerNode } from "trigger/node/trigger-node";
import { getDamageData } from "../trigger-action-roll-damage";
import { getSaveData } from "../trigger-action-roll-save";

class ToolbeltRollDamageTriggerAction extends TriggerNode<typeof toolbeltRollDamageSchema> {
    async execute(): Promise<void> {
        const damage = await getDamageData(this as TriggerNode);

        if (!damage) {
            return this.send("out");
        }

        const [formula, damageData] = damage;
        const saveData = await getSaveData(this, damageData.target.actor);

        if (!saveData) {
            return this.send("out");
        }

        const { dcData, isBasic, slug } = saveData;

        damageData.toolbelt = {
            save: {
                basic: !!isBasic,
                dc: dcData.value,
                statistic: slug,
                author: damageData.origin?.actor.uuid,
            },
        };

        await rollDamageFromFormula(formula, damageData);

        return this.send("out");
    }
}

export { ToolbeltRollDamageTriggerAction };
