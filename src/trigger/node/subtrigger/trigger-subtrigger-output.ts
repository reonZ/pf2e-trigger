import { R } from "module-helpers";
import { TriggerNode } from "../trigger-node";

class OutputSubtrigger extends TriggerNode {
    async execute(): Promise<void> {
        this.options.parentVariables = R.fromEntries(
            await Promise.all(
                this.custom.inputs.map(
                    async (input) => [input.key, await this.get(input.key)] as const
                )
            )
        );

        this.options.send.out = true;
    }
}

interface OutputSubtrigger extends TriggerNode {
    get options(): SubtriggerExecuteOptions;
}

export { OutputSubtrigger };
