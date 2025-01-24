import { NodeDataEntry } from "data/data-entry";
import { NodeData, NodeEntryValue } from "data/data-node";
import { ItemPF2e, MacroPF2e, R } from "module-helpers";
import {
    ExtractSchemaEntryType,
    ExtractSchemaInputsKeys,
    ExtractSchemaOuputsKeys,
    ExtractSchemaVariableType,
    NodeSchema,
    NodeSchemaInputEntry,
    NodeSchemaOutputEntry,
    NodeType,
    RollNodeEntry,
    getDefaultInputValue,
    isInputSchemaEntry,
} from "schema/schema";
import { NodeSchemaMap, getSchemaMap } from "schema/schema-list";
import { schemaVariable } from "schema/schema-variable";
import { Trigger, TriggerExecuteOptions } from "trigger/trigger";

abstract class TriggerNode<TSchema extends NodeSchema = NodeSchema> {
    #data: NodeData;
    #schema: NodeSchemaMap;
    #trigger: Trigger;
    #get: Record<string, () => Promisable<any>> = {};
    #send: Record<string, (target: TargetDocuments, value?: TriggerNodeEntryValue) => void> = {};

    constructor(trigger: Trigger, data: NodeData) {
        this.#data = data;
        this.#trigger = trigger;
        this.#schema = getSchemaMap(data);
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

    setOption<K extends keyof TriggerExecuteOptions>(key: K, value: TriggerExecuteOptions[K]) {
        this.#trigger.setOption(key, value);
    }

    getVariable(nodeId: string, key: string): TriggerNodeEntryValue {
        return this.#trigger.getVariable(nodeId, key);
    }

    setVariable(key: ExtractSchemaVariableType<TSchema>, value: TriggerNodeEntryValue) {
        this.#trigger.setVariable(this.id, key, value);
    }

    send<K extends ExtractSchemaOuputsKeys<TSchema>>(
        key: K,
        target: TargetDocuments,
        value?: ExtracSchemaOutputValueType<TSchema, K>
    ) {
        if (this.#send[key]) {
            return this.#send[key](target, value);
        }

        const output = this.#data.outputs[key] as NodeDataEntry | undefined;
        const otherNodes = (output?.ids ?? []).map((id) => this.#trigger.getNodeFromEntryId(id));

        this.#send[key] = (target: TargetDocuments, value?: TriggerNodeEntryValue) => {
            for (const otherNode of otherNodes) {
                otherNode._execute(target, value);
            }
        };

        this.#send[key](target, value);
    }

    async get<K extends ExtractSchemaInputsKeys<TSchema>>(
        key: K
    ): Promise<ExtractSchemaInputValueType<TSchema, K>> {
        if (this.#get[key]) {
            return this.#get[key]();
        }

        const input = this.#data.inputs[key] as NodeDataEntry | undefined;
        if (input) {
            if ("value" in input) {
                this.#get[key] = () => input.value;
            } else if (R.isArray(input.ids)) {
                const otherNode = this.#trigger.getNodeFromEntryId(input.ids[0]);

                if (otherNode.type === "variable") {
                    const node = otherNode as TriggerNode<typeof schemaVariable>;
                    const nodeId = await node.get("id");
                    const variableKey = await node.get("key");

                    this.#get[key] = () => this.getVariable(nodeId, variableKey);
                } else {
                    this.#get[key] = () => otherNode._query(key);
                }
            } else {
                this.#get[key] = () => undefined;
            }

            return this.#get[key]();
        }

        const schemaInput = this.#schema.inputs[key];
        if (isInputSchemaEntry(schemaInput)) {
            this.#get[key] = () => getDefaultInputValue(schemaInput);
        } else {
            this.#get[key] = () => undefined;
        }

        return this.#get[key]();
    }

    protected async _execute(
        target: TargetDocuments,
        value?: TriggerNodeEntryValue
    ): Promise<void> {
        throw new Error("_execute not implemented.");
    }

    protected async _query(
        key: ExtractSchemaOuputsKeys<TSchema>
    ): Promise<TriggerNodeEntryValue | undefined> {
        throw new Error("_query not implemented.");
    }
}

type ExtractSchemaInputValueType<
    S extends NodeSchema,
    K extends ExtractSchemaInputsKeys<S>
> = S extends {
    inputs: NodeSchemaInputEntry[];
}
    ? ExtractSchemaEntryType<Extract<S["inputs"][number], { key: K }>["type"]>
    : never;

type ExtracSchemaOutputValueType<
    S extends NodeSchema,
    K extends ExtractSchemaOuputsKeys<S>
> = S extends {
    outputs: NodeSchemaOutputEntry[];
}
    ? ExtractSchemaEntryType<Extract<S["outputs"][number], { key: K }>["type"]>
    : never;

type TriggerNodeEntryValue =
    | NodeEntryValue
    | ItemPF2e
    | MacroPF2e
    | TargetDocuments
    | RollNodeEntry;

export { TriggerNode };
export type { TriggerNodeEntryValue };
