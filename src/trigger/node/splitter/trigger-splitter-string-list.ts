import { stringListSchema } from "schema/splitter/schema-splitter-string-list";
import { TriggerNode } from "../trigger-node";

class StringListTriggerSplitter extends TriggerNode<typeof stringListSchema> {
    async execute(): Promise<void> {
        const input = (await this.get("input")).trim();

        if (input) {
            return this.send(input);
        }
    }
}

export { StringListTriggerSplitter };
