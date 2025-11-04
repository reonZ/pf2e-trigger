import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class ContainsEntryTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "contains-entry">> {
    async execute(): Promise<boolean> {
        const list = await this.get("list");
        const entry = await this.get("entry");
        const sendKey = !!entry && list.includes(entry);

        return this.send(sendKey);
    }
}

export { ContainsEntryTriggerNode };
