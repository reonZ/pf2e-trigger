import { TriggerNode } from "../trigger-node";

class OutputSubtrigger extends TriggerNode {
    async execute(): Promise<void> {
        const variables = await Promise.all(
            this.custom.inputs.map(async (input) => [input.key, await this.get(input.key)] as const)
        );

        for (const [key, value] of variables) {
            this.options.parentVariables[key] = value;
        }

        this.options.send.out = true;
    }
}

interface OutputSubtrigger extends TriggerNode {
    get options(): SubtriggerExecuteOptions;
}

export { OutputSubtrigger };
