import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class SubtriggerOutputTriggerNode extends TriggerNode<
    NodeSchemaOf<"subtrigger", "subtrigger-output">
> {
    async execute(): Promise<boolean> {
        const outputs = await Promise.all(
            this.customInputs.map(async ({ key }) => [key, await this.get(key)])
        );

        this.trigger.setOption("outputs", outputs);

        return this.send("out");
    }
}

export { SubtriggerOutputTriggerNode };
