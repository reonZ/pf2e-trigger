import { rollDamageSchema } from "@schema/action/schema-roll-damage";
import { TriggerNode } from "../trigger-node";
import { TriggerExecuteOptions } from "@trigger/trigger";
import { R, rollDamageFromFormula } from "module-helpers";

class RollDamageTriggerNode extends TriggerNode<typeof rollDamageSchema> {
    protected async _execute(origin: TargetDocuments, options: TriggerExecuteOptions) {
        const formula = await this.get("formula", origin, options);
        if (!R.isString(formula) || !formula.trim()) return;

        const target = options.target;

        rollDamageFromFormula(formula, {
            // item,
            target,
            origin: options.source ?? target,
        });
    }
}

export { RollDamageTriggerNode };
