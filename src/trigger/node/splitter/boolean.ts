import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class BooleanSplitterTriggerNode extends TriggerNode<NodeSchemaOf<"splitter", "boolean-splitter">> {
    async execute(): Promise<boolean> {
        const sendKey = await this.get("input");
        return this.send(sendKey);
    }
}

export { BooleanSplitterTriggerNode };
