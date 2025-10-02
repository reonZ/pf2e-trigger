import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class GetPercentTriggerNode extends TriggerNode<NodeSchemaOf<"action", "get-percent">> {
    async execute(): Promise<boolean> {
        const a = await this.get("a");
        const b = await this.get("b");
        const p = Math.round((a / b) * 100);

        this.setVariable("result", p);
        return this.send("out");
    }
}

export { GetPercentTriggerNode };
