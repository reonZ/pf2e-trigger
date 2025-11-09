import { createEntryId, TriggerData } from "data";
import { R } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { Trigger, TriggerNode, TriggerPreOptions } from "trigger";
import { SubtriggerOutputOptions } from "./output";

class SubtriggerNodeTriggerNode extends TriggerNode<NodeSchemaOf<"subtrigger", "subtrigger-node">> {
    get subtrigger(): TriggerData | undefined {
        return this.triggers?.model?.subtriggers.get(this.nodeTarget);
    }

    async execute(): Promise<boolean> {
        const subtrigger = this.subtrigger;

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

        if (!options.proceed) {
            return true;
        }

        if (options.outputs) {
            for (const [key, value] of options.outputs) {
                this.setVariable(key, value);
            }
        }

        return this.send("out");
    }
}

interface SubtriggerNodeTriggerNode {
    get nodeTarget(): string;
}

type SubtriggerOptions = TriggerPreOptions & Partial<SubtriggerOutputOptions>;

export { SubtriggerNodeTriggerNode };
