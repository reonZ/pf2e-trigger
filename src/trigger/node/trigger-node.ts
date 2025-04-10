import {
    getDefaultInputValue,
    getSelectOptions,
    isListNodeEntry,
    isNonNullNodeEntry,
} from "data/data-entry";
import { ActorPF2e, ItemPF2e, R, getItemWithSourceId } from "module-helpers";
import { Trigger } from "trigger/trigger";

class TriggerNode<TSchema extends NodeRawSchema = NodeRawSchema> {
    #data: NodeData;
    #schema: NodeSchemaMap;
    #trigger: Trigger;
    #get: Record<string, () => Promisable<any>> = {};

    constructor(trigger: Trigger, data: NodeData, schema: NodeSchema) {
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

    get data(): NodeData {
        return this.#data;
    }

    get custom(): NodeDataCustom {
        return this.#data.custom;
    }

    get trigger(): Trigger {
        return this.#trigger;
    }

    get localizePath(): string {
        return `node.${this.type}.${this.key}`;
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
        const outputId = this.#data.outputs[key]?.ids?.[0];
        const otherNode = outputId ? this.#trigger.getNodeFromEntryId(outputId) : undefined;

        return otherNode?.execute();
    }

    async getTarget<K extends ExtractSchemaInputsTargets<TSchema>>(
        key: K
    ): Promise<TargetDocuments | undefined> {
        const target = await this.get(key as any);
        return target === null ? undefined : (target as TargetDocuments | undefined) ?? this.target;
    }

    async getTargetActor<K extends ExtractSchemaInputsTargets<TSchema>>(
        key: K
    ): Promise<ActorPF2e | undefined> {
        const target = await this.getTarget(key);
        return target?.actor;
    }

    async get<K extends ExtractSchemaInputs<TSchema>>(
        key: K
    ): Promise<ExtractSchemaInputValueType<TSchema, K>> {
        if (this.#get[key]) {
            return this.#get[key]();
        }

        const input = this.#data.inputs[key] as NodeDataEntry | undefined;

        const getDefault = () => {
            const schemaInput = this.#schema.inputs[key];
            return isNonNullNodeEntry(schemaInput)
                ? getDefaultInputValue(schemaInput)
                : isListNodeEntry(schemaInput)
                ? []
                : undefined;
        };

        if (input) {
            if (input.ids?.length) {
                const entryId = input.ids[0];
                const otherNode = this.#trigger.getNodeFromEntryId(entryId);

                if (otherNode) {
                    if (["value", "variable", "converter"].includes(otherNode.type)) {
                        const schema = this.schema.inputs[key] as NodeSchemaInput;

                        if (schema.type === "select") {
                            const options = R.pipe(
                                getSelectOptions(schema.field),
                                R.map((option) => (R.isPlainObject(option) ? option.value : option))
                            );

                            this.#get[key] = async () => {
                                const query = ((await otherNode.query(key)) ?? "") as string;
                                return options.includes(query) ? query : options[0];
                            };
                        } else {
                            this.#get[key] = () => otherNode.query(key) ?? getDefault();
                        }
                    } else {
                        this.#get[key] = () => this.options.variables[entryId] ?? getDefault();
                    }
                } else {
                    this.#get[key] = () => getDefault();
                }
            } else if ("value" in input) {
                this.#get[key] = () => input.value;
            } else {
                this.#get[key] = () => getDefault();
            }
        } else {
            this.#get[key] = () => getDefault();
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
