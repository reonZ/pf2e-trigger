import { R } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class RandomNumberTriggerNode extends TriggerNode<NodeSchemaOf<"action", "random-number">> {
    async execute(): Promise<boolean> {
        const min = await this.get("min");
        const max = await this.get("max");
        const result = R.randomInteger(min, max);

        this.setVariable("result", result);

        return this.send("out");
    }
}

export { RandomNumberTriggerNode };
