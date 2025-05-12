import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class SubtriggerOutputTriggerNode extends TriggerNode<
    NodeSchemaOf<"subtrigger", "subtrigger-output">,
    SubtriggerOutputOptions
> {
    async execute(): Promise<boolean> {
        const outputs = await Promise.all(
            this.customInputs.map(async ({ key }) => [key, await this.get(key)])
        );

        this.setOption("outputs", outputs);

        return this.send("out");
    }
}

type SubtriggerOutputOptions = {
    outputs: string[][];
};

export { SubtriggerOutputTriggerNode };
