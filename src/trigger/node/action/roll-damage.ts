import { getExtraRollOptions, rollDamageFromFormula } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class RollDamageTriggerNode extends TriggerNode<RollDamageSchema> {
    async execute(): Promise<boolean> {
        const formula = await this.get("formula");

        if (!formula) {
            return this.send("out");
        }

        const extraRollOptions = getExtraRollOptions({
            options: await this.get("options"),
            traits: await this.get("traits"),
        });

        await rollDamageFromFormula(formula, {
            item: await this.get("item"),
            origin: await this.get("origin"),
            target: await this.getTarget("target"),
            skipDialog: true,
            extraRollOptions,
        });

        return this.send("out");
    }
}

type RollDamageSchema = NodeSchemaOf<"action", "roll-damage">;

export { RollDamageTriggerNode };
