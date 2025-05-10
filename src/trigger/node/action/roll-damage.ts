import { rollDamageFromFormula } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { getRollDamageData, TriggerNode } from "trigger";

class RollDamageTriggerNode extends TriggerNode<NodeSchemaOf<"action", "roll-damage">> {
    async execute(): Promise<boolean> {
        const data = await getRollDamageData(this);

        if (data) {
            const { damageOptions, formula } = data;
            await rollDamageFromFormula(formula, damageOptions);
        }

        return this.send("out");
    }
}

export { RollDamageTriggerNode };
