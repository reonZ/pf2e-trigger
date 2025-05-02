import { createEntryId, NodeDataEntry, NodeEntryId, NodeType, TriggerNodeData } from "data";
import { R } from "module-helpers";
import { NodeInputSource, NodeOutputSource, NodeRawSchema } from "schema";
import { Trigger, TriggerValue } from "trigger";

class TriggerNode<TSchema extends NodeRawSchema = NodeRawSchema> {
    #trigger: Trigger;
    #data: TriggerNodeData;
    #get: Record<string, () => any> = {};

    constructor(trigger: Trigger, data: TriggerNodeData) {
        this.#data = data;
        this.#trigger = trigger;
    }

    get id(): string {
        return this.#data.id;
    }

    get type(): NodeType {
        return this.#data.type;
    }

    get trigger(): Trigger {
        return this.#trigger;
    }

    get target(): TargetDocuments {
        return this.trigger.target;
    }

    get inputs(): NodeInputSource[] {
        return this.#data.custom?.inputs ?? [];
    }

    get outputs(): NodeOutputSource[] {
        return this.#data.custom?.outputs ?? [];
    }

    async execute(): Promise<boolean> {
        throw new Error(`execute not implemented in ${this.constructor.name}.`);
    }

    async query<K extends ExtractOutputKey<TSchema>>(
        key: K
    ): Promise<ExtractOutputValue<TSchema, K>> {
        throw new Error(`query not implemented in ${this.constructor.name}.`);
    }

    async send(key: ExtractOutKey<TSchema>): Promise<boolean> {
        return this.#getFirstNodeFromEntries(this.#data.outputs[key])?.node.execute() ?? false;
    }

    setVariable<K extends ExtractOutputKey<TSchema>>(
        key: K,
        value: ExtractOutputValue<TSchema, K>
    ) {
        const entryId = createEntryId(this.id, "outputs", key);
        this.trigger.setVariable(entryId, value);
    }

    async getTarget(key: ExtractTargetKey<TSchema>): Promise<TargetDocuments | undefined> {
        const target = await this.get(key as any);
        return target === null ? undefined : (target as TargetDocuments | undefined) ?? this.target;
    }

    async get<K extends ExtractInputKey<TSchema>>(key: K): Promise<ExtractInputValue<TSchema, K>> {
        if (this.#get[key]) {
            return this.#get[key]();
        }

        const input = this.#data.inputs[key] ?? {};
        const nodeEntry = this.#getFirstNodeFromEntries(input);

        if (nodeEntry) {
            const { entryId, node } = nodeEntry;

            if (["value", "variable"].includes(node.type)) {
                const schemaInput = this.#data.schemaInputs[key];

                if (schemaInput.type === "select") {
                    const options = (schemaInput.field?.options ?? []).map(({ value }) => value);

                    this.#get[key] = async () => {
                        const query = ((await node.query(key)) ?? "") as string;
                        return options.includes(query) ? query : options[0] ?? "";
                    };
                } else {
                    this.#get[key] = () => node.query(key) ?? this.#getDefault(key);
                }
            } else {
                this.#get[key] = () => this.trigger.getVariable(entryId) ?? this.#getDefault(key);
            }
        } else if (R.isNonNullish(input.value)) {
            this.#get[key] = () => input.value;
        } else {
            this.#get[key] = () => this.#getDefault(key);
        }

        return this.#get[key]();
    }

    #getDefault(key: string) {
        const schemaInput = this.#data.schemaInputs[key];
        const field = schemaInput.field;

        if (schemaInput.field && "default" in schemaInput.field) {
            return schemaInput.field.default;
        }

        switch (schemaInput.type) {
            case "number": {
                return field ? Math.clamp(0, field?.min ?? -Infinity, field?.max ?? Infinity) : 0;
            }

            case "boolean": {
                return false;
            }

            case "text": {
                return "";
            }

            case "list": {
                return [];
            }

            case "select": {
                return field?.options?.[0].value ?? "";
            }

            case "dc":
            case "duration":
            case "item":
            case "target": {
                return undefined;
            }
        }
    }

    #getFirstNodeFromEntries(
        entries: NodeDataEntry
    ): { entryId: NodeEntryId; node: TriggerNode } | undefined {
        for (const entryId of entries?.ids ?? []) {
            const node = this.#trigger.getNodeFromEntryId(entryId);

            if (node) {
                return { node, entryId };
            }
        }
    }
}

// input

type ExtractTargetKey<S extends NodeRawSchema> = Extract<
    ExtractArrayUnion<S["inputs"]>,
    { type: "target" }
>["key"];

type ExtractInputKey<S extends NodeRawSchema> = ExtractArrayUnion<S["inputs"]> extends {
    key: infer K extends string;
}
    ? K
    : string;

type ExtractInputType<S extends NodeRawSchema, K extends ExtractInputKey<S>> = Extract<
    ExtractArrayUnion<S["inputs"]>,
    { key: K }
>["type"];

type ExtractInputValue<S extends NodeRawSchema, K extends ExtractInputKey<S>> = TriggerValue<
    ExtractInputType<S, K>
>;

// output

type ExtractOutputKey<S extends NodeRawSchema> = ExtractArrayUnion<S["outputs"]> extends {
    key: infer K extends string;
}
    ? K
    : string;

type ExtractOutputType<S extends NodeRawSchema, K extends ExtractOutputKey<S>> = Extract<
    ExtractArrayUnion<S["outputs"]>,
    { key: K }
>["type"];

type ExtractOutputValue<S extends NodeRawSchema, K extends ExtractOutputKey<S>> = TriggerValue<
    ExtractOutputType<S, K>
>;

type ExtractOutKey<S extends NodeRawSchema> = S extends {
    outs: ReadonlyArray<{ key: infer K extends string }>;
}
    ? K
    : "out";

export { TriggerNode };
