import { getDefaultInputValue, isNonNullNodeEntry } from "data/data-entry";
import { ActorPF2e, ItemPF2e, R, getItemWithSourceId } from "module-helpers";
import { BaseTrigger } from "trigger/trigger-base";

class TriggerNode<TSchema extends NodeRawSchema = NodeRawSchema> {
    #data: NodeData;
    #schema: NodeSchemaMap;
    #trigger: BaseTrigger;
    #get: Record<string, () => Promisable<any>> = {};
    #send: Record<string, () => Promise<void>> = {};

    constructor(trigger: BaseTrigger, data: NodeData, schema: NodeSchema) {
        this.#data = data;
        this.#trigger = trigger;

        this.#schema = {
            ...schema,
            inputs: R.mapToObj(schema.inputs, (input) => [input.key, input]),
            outputs: R.mapToObj(schema.outputs, (output) => [output.key, output]),
        };
    }

    get id(): string {
        return this.#data.id;
    }

    get type(): NodeType {
        return this.#data.type;
    }

    get key(): string {
        return this.#data.key;
    }

    get options(): TriggerExecuteOptions {
        return this.#trigger.options;
    }

    get schema(): NodeSchemaMap {
        return this.#schema;
    }

    get target(): TargetDocuments {
        return this.options.this;
    }

    get custom(): NodeDataCustom {
        return this.#data.custom;
    }

    setVariable<K extends ExtractSchemaVariableKeys<TSchema>>(
        key: K,
        value: ExtractSchemaVariableValueType<TSchema, K>
    ) {
        const id: NodeEntryId = `${this.id}.outputs.${key}`;
        this.options.variables[id] = value;
    }

    async execute(): Promise<void> {
        throw new Error(`execute not implemented in ${this.constructor.name}.`);
    }

    async query(key: ExtractSchemaVariableKeys<TSchema>): Promise<TriggerEntryValue> {
        throw new Error(`query not implemented in ${this.constructor.name}.`);
    }

    async send<K extends ExtractSchemaOutsKeys<TSchema>>(key: K): Promise<void> {
        if (!this.#send[key]) {
            const outputId = this.#data.outputs[key]?.ids?.[0];
            const otherNode = outputId ? this.#trigger.getNodeFromEntryId(outputId) : undefined;

            this.#send[key] = async () => {
                await otherNode?.execute();
            };
        }

        return this.#send[key]();
    }

    async get<K extends ExtractSchemaInputs<TSchema>>(
        key: K
    ): Promise<ExtractSchemaInputValueType<TSchema, K>> {
        if (this.#get[key]) {
            return this.#get[key]();
        }

        const input = this.#data.inputs[key] as NodeDataEntry | undefined;

        const setToDefault = () => {
            const schemaInput = this.#schema.inputs[key];
            if (isNonNullNodeEntry(schemaInput)) {
                this.#get[key] = () => getDefaultInputValue(schemaInput);
            } else {
                this.#get[key] = () => undefined;
            }
        };

        if (input) {
            if (input.ids?.length) {
                const entryId = input.ids[0];
                const otherNode = this.#trigger.getNodeFromEntryId(entryId);

                if (otherNode) {
                    if (["value", "variable", "converter"].includes(otherNode.type)) {
                        this.#get[key] = () => otherNode.query(key);
                    } else {
                        this.#get[key] = () => this.options.variables[entryId];
                    }
                } else {
                    setToDefault();
                }
            } else if ("value" in input) {
                this.#get[key] = () => input.value;
            } else {
                setToDefault();
            }
        } else {
            setToDefault();
        }

        return this.#get[key]();
    }

    getExistingItem({ actor }: TargetDocuments, item?: ItemPF2e): ItemPF2e<ActorPF2e> | null {
        return item?.parent === actor
            ? (item as ItemPF2e<ActorPF2e>)
            : !!item
            ? getItemWithSourceId(actor, item.sourceId ?? item.uuid)
            : null;
    }
}

type NodeSchemaMap = Omit<NodeSchema, "inputs" | "outputs"> & {
    inputs: Record<string, NodeSchemaInput | NodeSchemaBridge>;
    outputs: Record<string, NodeSchemaVariable | NodeSchemaBridge>;
};

export { TriggerNode };
