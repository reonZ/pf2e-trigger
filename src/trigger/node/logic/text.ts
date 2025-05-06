import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class EqTextTriggerNode extends TriggerNode<NodeSchemaOf<"logic", "eq-text">> {
    async execute(): Promise<boolean> {
        const a = await this.get("a");
        const b = await this.get("b");

        return this.send(a === b);
    }
}

export { EqTextTriggerNode };
