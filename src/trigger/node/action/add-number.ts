import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class AddNumberTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-number">> {
    async execute(): Promise<boolean> {
        const a = await this.get("a");
        const b = await this.get("b");

        this.setVariable("result", a + b);
        return this.send("out");
    }
}

export { AddNumberTriggerNode };
