import { rollDamageFromFormula, SaveType } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { getRollDamageData, TriggerNode } from "trigger";

class RollDamageSaveTriggerNode extends TriggerNode<NodeSchemaOf<"action", "roll-damage-save">> {
    async execute(): Promise<boolean> {
        const damageData = await getRollDamageData(this);

        if (!damageData) {
            return this.send("out");
        }

        const { damageOptions, formula, roll } = damageData;

        damageOptions.toolbelt = {
            author: damageOptions.origin?.actor.uuid,
            options: roll.options,
            traits: roll.traits,
            item: roll.item?.uuid,
            saveVariants: {
                null: {
                    basic: await this.get("basic"),
                    dc: (await this.get("dc")).value,
                    statistic: (await this.get("save")) as SaveType,
                },
            },
        };

        await rollDamageFromFormula(formula, damageOptions);

        return this.send("out");
    }
}

export { RollDamageSaveTriggerNode };
