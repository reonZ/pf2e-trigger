import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class TextSplitterTriggerNode extends TriggerNode<NodeSchemaOf<"splitter", "text-splitter">> {
    async execute(): Promise<boolean> {
        const entry = await this.get("input");
        const out = this.customOuts.find(({ key }) => key === entry);

        if (out) {
            return this.send(entry as any);
        }

        return this.send("none");
    }
}

export { TextSplitterTriggerNode };
