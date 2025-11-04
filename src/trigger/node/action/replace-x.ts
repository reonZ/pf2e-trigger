import { getDamageRollClass } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class ReplaceXTriggerNode extends TriggerNode<NodeSchemaOf<"action", "replace-x">> {
    async execute(): Promise<boolean> {
        const formula = await this.get("formula");
        const x = await this.get("x");
        const DamageRoll = getDamageRollClass();
        const replaced = DamageRoll.replaceFormulaData(formula, { x });

        this.setVariable("result", replaced);
        return this.send("out");
    }
}

export { ReplaceXTriggerNode };
