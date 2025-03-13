import { localize } from "module-helpers";
import { TriggerNode } from "../trigger-node";

class ConsoleLogTriggerNode extends TriggerNode {
    async execute(): Promise<void> {
        const target = this.target;
        const inputs = this.custom.inputs as NodeSchemaInput[];
        const entries = await Promise.all(
            inputs.map(
                async (input) => [input.label ?? input.key, await this.get(input.key)] as const
            )
        );

        console.group(this.trigger.name);
        console.log(`${localize("node.entry.this")}:`, target);

        for (const [label, value] of entries) {
            console.log(`${label}:`, value);
        }

        console.groupEnd();

        this.send("out");
    }
}

export { ConsoleLogTriggerNode };
