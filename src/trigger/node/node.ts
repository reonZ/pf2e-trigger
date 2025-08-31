import {
    createEntryId,
    DOCUMENT_TYPES,
    NodeDataEntry,
    NodeEntryId,
    NodeEntryType,
    NodeType,
    TriggerNodeData,
} from "data";
import {
    ActorPF2e,
    getItemFromUuid,
    getItemSourceId,
    isUuidOf,
    ItemPF2e,
    MODULE,
    R,
} from "module-helpers";
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
    TriggerEffectEntry,
    TriggerRollEntry,
    TriggerValue,
} from "trigger";

class TriggerNode<
    TSchema extends NodeRawSchema = NodeRawSchema,
    TOptions extends Record<string, any> = Record<string, any>
> {
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

    get localizePath(): string {
        return this.#data.localizePath;
    }

    async execute(): Promise<boolean> {
        throw new Error(`execute not implemented in ${this.key}.`);
    }

    async query<K extends ExtractOutputKey<TSchema>>(key: K): Promise<TriggerValue> {
        throw new Error(`query not implemented in ${this.key}.`);
    }

    async send(key: ExtractOutKey<TSchema>): Promise<boolean> {
        const output = String(key);
        return this.#getFirstNodeFromEntries(this.#data.outputs[output])?.node.execute() ?? true;
    }

    getOption<K extends keyof TOptions & string>(key: K): TOptions[K] {
        return this.trigger.getOption(key);
    }

    setOption<K extends keyof TOptions & string>(key: K, value: TOptions[K]) {
        this.trigger.setOption(key, value);
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
            this.#get[key] = () => {
                return this.isValidEntryValue(schemaInput, input.value)
                    ? input.value
                    : this.getDefaultValue(schemaInput);
            };
        } else {
            this.#get[key] = () => {
                return this.getDefaultValue(schemaInput);
            };
        }

        return this.#get[key]();
    }

    getDefaultValue(schemaInput: SchemaInputAdjacent): any {
        const field = schemaInput.field;

        if (field && "default" in field) {
            return field.default;
        }

        const type = schemaInput.type;

        if (type === "boolean") {
            return false;
        }

        if (type === "dc") {
            return { value: 0, scope: "check" } satisfies TriggerDcEntry;
        }

        if (type === "duration") {
            return { expiry: null, unit: "unlimited", value: -1 } satisfies TriggerDurationEntry;
        }

        if (type === "effect") {
            return {
                name: "",
                unidentified: false,
                img: "" as ImageFilePath,
                duration: {
                    expiry: null,
                    unit: "unlimited",
                    value: -1,
                },
            } satisfies TriggerEffectEntry;
        }

        if (type === "list") {
            return [];
        }

        if (type === "number") {
            return field ? Math.clamp(0, field?.min ?? -Infinity, field?.max ?? Infinity) : 0;
        }

        if (type === "object") {
            return {};
        }

        if (type === "roll") {
            return { options: [], traits: [] } satisfies TriggerRollEntry;
        }

        if (type === "select") {
            return field?.options?.[0].value ?? "";
        }

        if (R.isIncludedIn(type, ["text", "uuid"] as const)) {
            return "";
        }

        return undefined;
    }

    async getConvertedValue(schemaInput: SchemaInputAdjacent, value: any): Promise<any> {
        if (R.isNullish(value)) {
            return this.getDefaultValue(schemaInput);
        }

        // expected type
        const type = schemaInput.type;

        // number
        if (type === "dc") {
            value = R.isNumber(value)
                ? ({ value, scope: "check" } satisfies TriggerDcEntry)
                : value;
        }
        // uuid
        else if (type === "item") {
            value = R.isString(value) && isUuidOf(value, "Item") ? getItemFromUuid(value) : value;
        }
        // select, text
        else if (type === "list") {
            value = R.isArray(value) ? value : [value];
        }
        // dc
        else if (type === "number") {
            value = isDcEntry(value) ? value.value : value;
        }
        // text
        else if (type === "select") {
            const options = (schemaInput.field?.options ?? []).map(({ value }) => value);
            value = options.includes(value) ? value : options[0] ?? "";
        }
        // list, select
        else if (type === "text") {
            value = R.isArray(value) ? value[0] ?? "" : value;
        }
        // item
        else if (type === "uuid") {
            value = value instanceof Item ? getItemSourceId(value as ItemPF2e) : value;
        }

        return this.isValidEntryValue(schemaInput, value)
            ? value
            : this.getDefaultValue(schemaInput);
    }

    isValidEntryValue(schemaInput: SchemaInputAdjacent, value: unknown): boolean {
        const type = schemaInput.type;

        if (type === "select") {
            const options = (schemaInput.field?.options ?? []).map((option) => option.value);
            return R.isString(value) && options.includes(value);
        }

        if (type === "uuid") {
            return R.isString(value);
        }

        return this.isValidCustomEntry(type, value);
    }

    isValidCustomEntry(type: NodeEntryType, value: unknown): boolean {
        if (type === "boolean") {
            return R.isBoolean(value);
        }

        if (type === "dc") {
            return isDcEntry(value);
        }

        if (type === "duration") {
            return isDurationEntry(value);
        }

        if (type === "effect") {
            return isEffectEntry(value);
        }

        if (type === "item") {
            return value instanceof Item;
        }

        if (type === "list") {
            return R.isArray(value) && value.every(R.isString);
        }

        if (type === "number") {
            return R.isNumber(value);
        }

        if (type === "object") {
            return R.isObjectType(value);
        }

        if (type === "roll") {
            return isRollEntry(value);
        }

        if (type === "target") {
            return (
                R.isPlainObject(value) &&
                value.actor instanceof Actor &&
                (!value.token || value.token instanceof TokenDocument)
            );
        }

        if (type === "text") {
            return R.isString(value);
        }

        return false;
    }

    setOutputValues(values: unknown) {
        if (!R.isArray(values)) return;

        try {
            const outputs = this.customOutputs;

            for (let i = 0; i < outputs.length; i++) {
                const value = values[i];
                if (R.isNullish(value)) continue;

                const output = outputs[i];

                if (this.isValidCustomEntry(output.type, value)) {
                    this.setVariable(output.key as any, value as any);
                }
            }
        } catch (err) {
            MODULE.error(`an error occured while setting output values for: ${this.id}`, err);
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

function isEffectEntry(value: unknown): value is TriggerEffectEntry {
    return R.isPlainObject(value) && (!value.duration || isDurationEntry(value.duration));
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

export { isUuidEntry, TriggerNode };
