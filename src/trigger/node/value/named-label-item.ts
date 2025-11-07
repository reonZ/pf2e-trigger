import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class NamedLabelItemTriggerNode extends TriggerNode<NodeSchemaOf<"value", "named-label-item">> {
    async query(): Promise<string> {
        const prefix = await this.get("prefix");
        const item = await this.get("item");

        return item ? `${prefix} (${item.name})` : prefix;
    }
}

export { NamedLabelItemTriggerNode };
