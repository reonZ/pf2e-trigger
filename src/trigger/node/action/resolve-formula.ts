import { getDamageRollClass, isValidTargetDocuments, ItemPF2e, R } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class ResolveFormulaTriggerNode extends TriggerNode<NodeSchemaOf<"action", "resolve-formula">> {
    async execute(): Promise<boolean> {
        const formula = await this.get("formula");

        if (!formula) {
            this.setVariable("result", 0);
            return this.send("out");
        }

        const formulaData = R.pipe(
            await this.getCustomInputs<ItemPF2e | TargetDocuments | number>(),
            R.mapToObj(([key, value]) => {
                return [
                    key.replace(/\s/gm, ""),
                    isValidTargetDocuments(value) ? value.actor : value,
                ] as const;
            })
        );

        const DamageRoll = getDamageRollClass();
        const finalized = DamageRoll.replaceFormulaData(formula, formulaData);
        const result = (await new Roll(finalized).evaluate()).total;

        this.setVariable("result", result);
        return this.send("out");
    }
}

export { ResolveFormulaTriggerNode };
