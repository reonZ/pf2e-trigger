import {
    createEntryId,
    DOCUMENT_TYPES,
    NodeCustomEntryType,
    NodeDataEntry,
    NodeEntryId,
    NodeEntryType,
    NodeType,
    TriggerNodeData,
} from "data";
import { ActorPF2e, getItemFromUuid, isUuidOf, ItemPF2e, R } from "module-helpers";
import {
    NodeFieldSchema,
    NodeInputSchema,
    NodeInputSource,
    NodeKey,
    NodeOutputSource,
    NodeRawSchema,
} from "schema";
import {
    Trigger,
    TriggerDcEntry,
    TriggerDurationEntry,
    TriggerRollEntry,
    TriggerValue,
} from "trigger";

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

    get key(): NodeKey {
        return this.#data.key;
    }

    get trigger(): Trigger {
        return this.#trigger;
    }

    get target(): TargetDocuments {
        return this.trigger.target;
    }

    get nodeTarget(): NodeEntryId | string | undefined {
        return this.#data.target;
    }

    get customInputs(): NodeInputSource[] {
        return this.#data.custom?.inputs ?? [];
    }

    get customOutputs(): NodeOutputSource[] {
        return this.#data.custom?.outputs ?? [];
    }

    get customOuts(): NodeOutputSource[] {
        return this.#data.custom?.outs ?? [];
    }

    get schemaInputs(): Collection<ModelPropsFromSchema<NodeInputSchema>> {
        return this.#data.schemaInputs;
    }

    async execute(): Promise<boolean> {
        throw new Error(`execute not implemented in ${this.key}.`);
    }

    async query<K extends ExtractOutputKey<TSchema>>(key: K): Promise<TriggerValue> {
        throw new Error(`query not implemented in ${this.key}.`);
    }

    async send(key: ExtractOutKey<TSchema>): Promise<boolean> {
        const output = String(key);
        return this.#getFirstNodeFromEntries(this.#data.outputs[output])?.node.execute() ?? false;
    }

    setVariable<K extends ExtractOutputKey<TSchema>>(
        key: K,
        value: ExtractOutputValue<TSchema, K>
    ) {
        const entryId = createEntryId(this, "outputs", key);
        this.trigger.setVariable(entryId, value);
    }

    async getTarget(key: ExtractTargetKey<TSchema>): Promise<TargetDocuments | undefined> {
        const target = await this.get(key as any);
        return target === null ? undefined : (target as TargetDocuments | undefined) ?? this.target;
    }

    async getTargetActor(key: ExtractTargetKey<TSchema>): Promise<ActorPF2e | undefined> {
        return (await this.getTarget(key))?.actor;
    }

    async get<K extends ExtractInputKey<TSchema>>(key: K): Promise<ExtractInputValue<TSchema, K>> {
        if (this.#get[key]) {
            return this.#get[key]();
        }

        const schemaInput = this.schemaInputs.get(key)!;
        const input = this.#data.inputs[key] ?? {};
        const nodeEntry = this.#getFirstNodeFromEntries(input);

        if (nodeEntry) {
            const { entryId, node } = nodeEntry;

            if (["value", "variable"].includes(node.type)) {
                this.#get[key] = async () => {
                    const value = await node.query(key);
                    return this.getConvertedValue(schemaInput, value);
                };
            } else {
                this.#get[key] = () => {
                    const value = this.trigger.getVariable(entryId);
                    return this.getConvertedValue(schemaInput, value);
                };
            }
        } else if (R.isNonNullish(input.value)) {
            this.#get[key] = () => input.value;
        } else {
            this.#get[key] = () => this.getDefaultValue(schemaInput);
        }

        return this.#get[key]();
    }

    getDefaultValue(schemaInput: SchemaInputAdjacent) {
        const field = schemaInput.field;

        if (field && "default" in field) {
            return field.default;
        }

        switch (schemaInput.type) {
            case "number": {
                return field ? Math.clamp(0, field?.min ?? -Infinity, field?.max ?? Infinity) : 0;
            }

            case "boolean": {
                return false;
            }

            case "text":
            case "uuid": {
                return "";
            }

            case "list": {
                return [];
            }

            case "select": {
                return field?.options?.[0].value ?? "";
            }

            case "dc": {
                return { value: 0, scope: "check" } satisfies TriggerDcEntry;
            }

            case "roll": {
                return { options: [], traits: [] } satisfies TriggerRollEntry;
            }

            case "duration": {
                return {
                    expiry: null,
                    unit: "unlimited",
                    value: -1,
                } satisfies TriggerDurationEntry;
            }

            default: {
                return undefined;
            }
        }
    }

    async getConvertedValue(schemaInput: SchemaInputAdjacent, value: any): Promise<any> {
        if (R.isNullish(value)) {
            return this.getDefaultValue(schemaInput);
        }

        // expected type
        switch (schemaInput.type) {
            // number
            case "dc": {
                return R.isNumber(value)
                    ? ({ value, scope: "check" } satisfies TriggerDcEntry)
                    : value;
            }

            // uuid
            case "item": {
                return R.isString(value) && isUuidOf(value, "Item")
                    ? getItemFromUuid(value)
                    : value;
            }

            // select, text
            case "list": {
                return R.isArray(value) ? value : [value];
            }

            // dc
            case "number": {
                return isDcEntry(value) ? value.value : value;
            }

            // text
            case "select": {
                const options = (schemaInput.field?.options ?? []).map(({ value }) => value);
                return options.includes(value) ? value : options[0] ?? "";
            }

            // list, select
            case "text": {
                return R.isArray(value) ? value[0] ?? "" : value;
            }

            // item
            case "uuid": {
                return value instanceof Item ? (value as ItemPF2e).sourceId ?? value.uuid : value;
            }

            default: {
                return value;
            }
        }
    }

    isValidCustomEntry(type: NodeEntryType, value: unknown) {
        switch (type as NodeCustomEntryType) {
            case "number": {
                return R.isNumber(value);
            }

            case "boolean": {
                return R.isBoolean(value);
            }

            case "text": {
                return R.isString(value);
            }

            case "item": {
                return value instanceof Item;
            }

            case "target": {
                return (
                    R.isPlainObject(value) &&
                    value.actor instanceof Actor &&
                    (!value.token || value.token instanceof TokenDocument)
                );
            }

            case "list": {
                return R.isArray(value) && value.every(R.isString);
            }

            case "dc": {
                return isDcEntry(value);
            }

            case "duration": {
                return isDurationEntry(value);
            }

            case "roll": {
                return isRollEntry(value);
            }

            default: {
                return false;
            }
        }
    }

    #getFirstNodeFromEntries(
        entries: NodeDataEntry
    ): { entryId: NodeEntryId; node: TriggerNode } | undefined {
        for (const entryId of entries?.ids ?? []) {
            const node = this.trigger.getNodeFromEntryId(entryId);

            if (node) {
                return { node, entryId };
            }
        }
    }
}

function isUuidEntry(value: unknown): value is DocumentUUID {
    return R.isString(value) && isUuidOf(value, DOCUMENT_TYPES);
}

function isRollEntry(value: unknown): value is TriggerRollEntry {
    return R.isPlainObject(value);
}

function isDcEntry(value: unknown): value is TriggerDcEntry {
    return R.isPlainObject(value) && R.isNumber(value.value);
}

function isDurationEntry(value: unknown): value is TriggerDurationEntry {
    return R.isPlainObject(value) && R.isNumber(value.value);
}

type SchemaInputAdjacent = {
    type: NodeEntryType;
    field?: NodeFieldSchema;
};

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
    ? K extends "true" | "false"
        ? K | boolean
        : K
    : "out";

export { isDcEntry, isDurationEntry, isRollEntry, isUuidEntry, TriggerNode };
