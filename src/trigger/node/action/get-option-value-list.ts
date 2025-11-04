import { R } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class GetOptionValueListTriggerNode extends TriggerNode<
    NodeSchemaOf<"action", "get-option-value-list">
> {
    async execute(): Promise<boolean> {
        const list = await this.get("list");
        const option = await this.get("option");

        if (!option) {
            this.setVariable("value", -1);
            return this.send("out");
        }

        const withSuffix = `${option}:`;
        const match = list.find((x) => x.startsWith(withSuffix));
        const value = match ? Number(match.split(":").at(-1)) : null;

        this.setVariable("value", R.isNumber(value) ? value : -1);
        return this.send("out");
    }
}

export { GetOptionValueListTriggerNode };
