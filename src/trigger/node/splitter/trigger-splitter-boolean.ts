import { booleanSplitterSchema } from "schema/splitter/schema-splitter-boolean";
import { TriggerNode } from "../trigger-node";

class BooleanTriggerSplitter extends TriggerNode<typeof booleanSplitterSchema> {
    async execute(): Promise<void> {
        const input = !!(await this.get("input"));
        return this.send(input ? "true" : "false");
    }
}

export { BooleanTriggerSplitter };
