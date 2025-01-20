import { rollDamageSchema } from "@schema/action/schema-roll-damage";
import { TriggerNode } from "../trigger-node";
import { TriggerExecuteOptions } from "@trigger/trigger";
import { R, rollDamageFromFormula } from "module-helpers";

class RollDamageTriggerNode extends TriggerNode<typeof rollDamageSchema> {
    protected async _execute(origin: TargetDocuments, options: TriggerExecuteOptions) {
        const damageOrigin = options.source ?? options.target;
        const formula = await this.get("formula");
        if (!R.isString(formula) || !formula.trim()) return;

        await rollDamageFromFormula(formula, {
            item: await this.get("item"),
            target: options.target,
            origin: damageOrigin,
        });

        this.send("out", origin, options);
    }
}

export { RollDamageTriggerNode };
