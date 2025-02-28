import { booleanSplitterSchema } from "schema/splitter/schema-splitter-boolean";
import { TriggerNode } from "../trigger-node";

class BooleanTriggerSplitter extends TriggerNode<typeof booleanSplitterSchema> {
    async execute(): Promise<void> {
        const value = !!(await this.get("boolean"));
        return this.send(value ? "true" : "false");
    }
}

export { BooleanTriggerSplitter };
