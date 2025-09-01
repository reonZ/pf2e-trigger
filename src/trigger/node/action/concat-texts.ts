import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class ConcatTextsTriggerNode extends TriggerNode<NodeSchemaOf<"action", "concat-texts">> {
    async execute(): Promise<boolean> {
        const a = await this.get("a");
        const b = await this.get("b");
        const separator = await this.get("separator");

        this.setVariable("result", a + separator + b);
        return this.send("out");
    }
}

export { ConcatTextsTriggerNode };
