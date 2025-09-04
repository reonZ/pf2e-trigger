import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class NumberSplitterTriggerNode extends TriggerNode<NodeSchemaOf<"splitter", "number-splitter">> {
    async execute(): Promise<boolean> {
        const entry = await this.get("input");
        const out = this.customOuts.find(({ key }) => Number(key) === entry);

        if (out) {
            return this.send(entry as any);
        }

        return this.send("none");
    }
}

export { NumberSplitterTriggerNode };
