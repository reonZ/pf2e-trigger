import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class JoinListTriggerNode extends TriggerNode<NodeSchemaOf<"action", "join-list">> {
    async execute(): Promise<boolean> {
        const list = await this.get("list");
        const separator = await this.get("separator");

        this.setVariable("result", list.join(separator));
        return this.send("out");
    }
}

export { JoinListTriggerNode };
