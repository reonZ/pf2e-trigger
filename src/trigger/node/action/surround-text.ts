import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class SurroundTextTriggerNode extends TriggerNode<NodeSchemaOf<"action", "surround-text">> {
    async execute(): Promise<boolean> {
        const input = await this.get("input");
        const prefix = await this.get("prefix");
        const suffix = await this.get("suffix");

        this.setVariable("result", prefix + input + suffix);
        return this.send("out");
    }
}

export { SurroundTextTriggerNode };
