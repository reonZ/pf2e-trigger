import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class SubtractNumberTriggerNode extends TriggerNode<NodeSchemaOf<"action", "subtract-number">> {
    async execute(): Promise<boolean> {
        const a = await this.get("a");
        const b = await this.get("b");

        this.setVariable("result", a - b);
        return this.send("out");
    }
}

export { SubtractNumberTriggerNode };
