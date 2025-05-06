import { createEntryId } from "data";
import { R } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { getSubtrigger, Trigger, TriggerNode, TriggerPreOptions } from "trigger";

class SubtriggerNodeTriggerNode extends TriggerNode<NodeSchemaOf<"subtrigger", "subtrigger-node">> {
    async execute(): Promise<boolean> {
        const subtrigger = getSubtrigger(this.nodeTarget as string);

        if (!subtrigger) {
            return this.send("out");
        }

        const variables = R.fromEntries(
            await Promise.all(
                this.schemaInputs.map(async ({ key }) => [
                    createEntryId(subtrigger.event, "outputs", key),
                    await this.get(key),
                ])
            )
        );

        const options: SubtriggerOptions = {
            this: this.target,
            variables,
        };

        const trigger = new Trigger(subtrigger, options);
        await trigger.execute();

        if (options.outputs) {
            for (const [key, value] of options.outputs) {
                this.setVariable(key, value);
            }
        }

        return this.send("out");
    }
}

type SubtriggerOptions = TriggerPreOptions & {
    outputs?: [string, never][];
};

export { SubtriggerNodeTriggerNode };
