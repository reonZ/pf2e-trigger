import { getExtraRollOptions, rollDamageFromFormula } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class RollDamageTriggerNode extends TriggerNode<NodeSchemaOf<"action", "roll-damage">> {
    async execute(): Promise<boolean> {
        const formula = await this.get("formula");

        if (!formula) {
            return this.send("out");
        }

        const roll = await this.get("roll");

        await rollDamageFromFormula(formula, {
            item: roll.item,
            origin: roll.origin,
            target: await this.getTarget("target"),
            skipDialog: true,
            extraRollOptions: getExtraRollOptions(roll),
        });

        return this.send("out");
    }
}

export { RollDamageTriggerNode };
