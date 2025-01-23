import { R, rollDamageFromFormula } from "module-helpers";
import { rollDamageSchema } from "schema/action/schema-roll-damage";
import { TriggerNode } from "../trigger-node";

class RollDamageTriggerNode extends TriggerNode<typeof rollDamageSchema> {
    protected async _execute(target: TargetDocuments) {
        const damageOrigin = await this.get("origin");
        const formula = await this.get("formula");
        if (!R.isString(formula) || !formula.trim()) return;

        await rollDamageFromFormula(formula, {
            item: await this.get("item"),
            target: this.options.this,
            origin: damageOrigin,
        });

        this.send("out", target);
    }
}

export { RollDamageTriggerNode };
