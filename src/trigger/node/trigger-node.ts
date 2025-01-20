import { NodeDataEntry } from "@data/data-entry";
import { NodeData, NodeEntryValue } from "@data/data-node";
import {
    ExtractSchemaEntryType,
    ExtractSchemaInputsKeys,
    ExtractSchemaOuputsKeys,
    NodeEntryType,
    NodeSchema,
    NodeSchemaInputEntry,
    NodeSchemaOutputEntry,
    NonNullableNodeEntryType,
    getDefaultInputValue,
    isInputSchemaEntry,
} from "@schema/schema";
import { NodeSchemaMap, getSchemaMap } from "@schema/schema-list";
import { Trigger, TriggerExecuteOptions } from "@trigger/trigger";
import { ItemPF2e, R } from "module-helpers";

abstract class TriggerNode<TSchema extends NodeSchema = NodeSchema> {
    #data: NodeData;
    #schema: NodeSchemaMap;
    #trigger: Trigger;

    constructor(trigger: Trigger, data: NodeData) {
        this.#data = data;
        this.#trigger = trigger;
        this.#schema = getSchemaMap(data);
    }

    async send<K extends ExtractSchemaOuputsKeys<TSchema>>(
        key: K,
        origin: TargetDocuments,
        options: TriggerExecuteOptions,
        value?: ExtracSchemaOutputValueType<TSchema, K>
    ): Promise<void> {
        const output = this.#data.outputs[key] as NodeDataEntry | undefined;

        for (const id of output?.ids ?? []) {
            const otherNode = this.#trigger.getNode(id);
            otherNode._execute(origin, options, value as any);
        }
    }

    async get<K extends ExtractSchemaInputsKeys<TSchema>>(
        key: K
    ): Promise<ExtractSchemaInputValueType<TSchema, K> | undefined> {
        const input = this.#data.inputs[key] as NodeDataEntry | undefined;

        if (input) {
            if (R.isArray(input.ids)) {
                const otherNode = this.#trigger.getNode(input.ids[0]);
                return otherNode._query(key) as any;
            }

            if ("value" in input) {
                return input.value as any;
            }
        }

        const schemaInput = this.#schema.inputs[key];
        return isInputSchemaEntry(schemaInput)
            ? (getDefaultInputValue(schemaInput) as any)
            : undefined;
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

type TriggerNodeEntryValue = NodeEntryValue | ItemPF2e;

export { TriggerNode };
export type { TriggerNodeEntryValue };
