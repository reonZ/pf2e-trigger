import { NodeDataEntry } from "data/data-entry";
import { NodeData, NodeEntryValue } from "data/data-node";
import { ItemPF2e, MacroPF2e, R } from "module-helpers";
import {
    ExtractSchemaEntryType,
    ExtractSchemaInputsKeys,
    ExtractSchemaOuputsKeys,
    NodeEntryType,
    NodeSchema,
    NodeSchemaInputEntry,
    NodeSchemaOutputEntry,
    NodeType,
    NonNullableNodeEntryType,
    getDefaultInputValue,
    isInputSchemaEntry,
} from "schema/schema";
import { NodeSchemaMap, getSchemaMap } from "schema/schema-list";
import { Trigger, TriggerExecuteOptions } from "trigger/trigger";

abstract class TriggerNode<TSchema extends NodeSchema = NodeSchema> {
    #data: NodeData;
    #schema: NodeSchemaMap;
    #trigger: Trigger;
    #get: Record<string, () => Promisable<any>> = {};
    #send: Record<
        string,
        (
            origin: TargetDocuments,
            options: TriggerExecuteOptions,
            value?: TriggerNodeEntryValue
        ) => void
    > = {};

    constructor(trigger: Trigger, data: NodeData) {
        this.#data = data;
        this.#trigger = trigger;
        this.#schema = getSchemaMap(data);
    }

    get type(): NodeType {
        return this.#data.type;
    }

    get key(): string {
        return this.#data.key;
    }

    send<K extends ExtractSchemaOuputsKeys<TSchema>>(
        key: K,
        origin: TargetDocuments,
        options: TriggerExecuteOptions,
        value?: ExtracSchemaOutputValueType<TSchema, K>
    ) {
        if (this.#send[key]) {
            return this.#send[key](origin, options, value);
        }

        const output = this.#data.outputs[key] as NodeDataEntry | undefined;
        const otherNodes = (output?.ids ?? []).map((id) => this.#trigger.getNode(id));

        this.#send[key] = (
            origin: TargetDocuments,
            options: TriggerExecuteOptions,
            value?: TriggerNodeEntryValue
        ) => {
            for (const otherNode of otherNodes) {
                otherNode._execute(origin, options, value);
            }
        };

        this.#send[key](origin, options, value);
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
                const otherNode = this.#trigger.getNode(input.ids[0]);
                this.#get[key] = () => otherNode._query(key);
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
        origin: TargetDocuments,
        options: TriggerExecuteOptions,
        value?: TriggerNodeEntryValue
    ): Promise<void> {
        throw new Error("_execute not implemented.");
    }

    protected async _query(
        key: ExtractSchemaInputsKeys<TSchema>
    ): Promise<TriggerNodeEntryValue | undefined> {
        throw new Error("_query not implemented.");
    }
}

type ExtractSchemaValueType<T extends NodeEntryType> = T extends NonNullableNodeEntryType
    ? ExtractSchemaEntryType<T>
    : T extends "item"
    ? ItemPF2e
    : T extends "macro"
    ? MacroPF2e
    : never;

type ExtractSchemaInputValueType<
    S extends NodeSchema,
    K extends ExtractSchemaInputsKeys<S>
> = S extends {
    inputs: NodeSchemaInputEntry[];
}
    ? ExtractSchemaValueType<Extract<S["inputs"][number], { key: K }>["type"]>
    : never;

type ExtracSchemaOutputValueType<
    S extends NodeSchema,
    K extends ExtractSchemaOuputsKeys<S>
> = S extends {
    outputs: NodeSchemaOutputEntry[];
}
    ? ExtractSchemaValueType<Extract<S["outputs"][number], { key: K }>["type"]>
    : never;

type TriggerNodeEntryValue = NodeEntryValue | ItemPF2e | MacroPF2e;

export { TriggerNode };
export type { TriggerNodeEntryValue };
