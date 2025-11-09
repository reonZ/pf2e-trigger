import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class SubtriggerOutputTriggerNode extends TriggerNode<
    NodeSchemaOf<"subtrigger", "subtrigger-output">,
    SubtriggerOutputOptions
> {
    async execute(): Promise<boolean> {
        const outputs = await this.getCustomInputs<never>();

        this.setOption("proceed", true);
        this.setOption("outputs", outputs);
        return this.send("out");
    }
}

type SubtriggerOutputOptions = {
    outputs: [string, never, string][];
    proceed: true;
};

export { SubtriggerOutputTriggerNode };
export type { SubtriggerOutputOptions };
