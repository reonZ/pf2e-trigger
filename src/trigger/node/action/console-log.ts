import { localize, MODULE } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class ConsoleLogTriggerNode extends TriggerNode<ConsoleLogSchema> {
    async execute(): Promise<boolean> {
        const target = this.target;
        const entries = await Promise.all(
            this.inputs.map(
                async (input) => [input.label ?? input.key, await this.get(input.key)] as const
            )
        );

        MODULE.group(this.trigger.name);
        MODULE.log(`${localize("entry.this")}:`, target);

        for (const [label, value] of entries) {
            MODULE.log(`${label}:`, value);
        }

        MODULE.groupEnd();

        return this.send("out");
    }
}

type ConsoleLogSchema = NodeSchemaOf<"action", "console-log">;

export { ConsoleLogTriggerNode };
