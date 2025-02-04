import { R } from "module-helpers";
import { BaseTrigger } from "trigger/trigger-base";
import { Subtrigger } from "trigger/trigger-subtrigger";
import { TriggerNode } from "./trigger-node";
import { subtriggerSchema } from "schema/subtrigger/schema-subtrigger";

class SubtriggerNode extends TriggerNode<typeof subtriggerSchema> {
    #subtrigger: Subtrigger;
    #variables: (readonly [string, () => Promise<TriggerEntryValue>])[];

    constructor(trigger: BaseTrigger, data: NodeData, schema: NodeSchema, subtrigger: Subtrigger) {
        super(trigger, data, schema);

        this.#subtrigger = subtrigger;

        this.#variables ??= R.pipe(
            R.values(this.schema.inputs),
            R.filter((input): input is NodeSchemaInput => "type" in input),
            R.map((input) => {
                return [input.key, () => this.get(input.key)] as const;
            })
        );
    }

    async execute(): Promise<void> {
        const variables = R.fromEntries(
            await Promise.all(this.#variables.map(async ([key, fn]) => [key, await fn()] as const))
        );

        const options: SubtriggerExecuteOptions = {
            this: this.target,
            variables,
            parentVariables: {},
            send: { out: false },
        };

        await this.#subtrigger.execute(options);

        for (const [key, value] of R.entries(options.parentVariables)) {
            this.setVariable(key, value);
        }

        if (options.send.out) {
            return this.send("out");
        }
    }
}

export { SubtriggerNode };
