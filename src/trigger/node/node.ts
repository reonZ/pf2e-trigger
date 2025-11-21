import {
    createEntryId,
    DOCUMENT_TYPES,
    NodeDataEntry,
    NodeEntryId,
    NodeEntryType,
    NodeType,
    TriggerData,
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
    UserPF2e,
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

const USER_QUERY_TIMEOUT = 30000;

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

    get triggers(): foundry.abstract.EmbeddedCollection<TriggerData> | undefined {
        return this.#data.triggers;
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

    getCustomInputs<T>(values: true): Promise<T[]>;
    getCustomInputs<T>(values?: false): Promise<[string, T, string][]>;
    getCustomInputs(values?: boolean) {
        return Promise.all(
            this.customInputs.map(async ({ key, label }) => {
                const value = await this.get(key as any);
                return values ? value : [key, value, label];
            })
        );
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

    async getLocalizedText(key: ExtractTextKey<TSchema>): Promise<string> {
        const value = await this.get(key as any);
        return R.isString(value) ? game.i18n.localize(value) : "";
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
                return this.finalizeValue(schemaInput, input.value);
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

        if (field && "default" in field && R.isNonNullish(field.default)) {
            return field.default;
        }

        const type = schemaInput.type;

        if (type === "boolean") {
            return false;
        }

        if (type === "dc") {
            return { value: 0, scope: "check" } satisfies TriggerDcEntry;
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
            return { notes: [], options: [], traits: [] } satisfies TriggerRollEntry;
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
        // list, select, number
        else if (type === "text") {
            value = R.isArray(value) ? value[0] ?? "" : R.isNumber(value) ? String(value) : value;
        }
        // item
        else if (type === "uuid") {
            value = value instanceof Item ? getItemSourceId(value as ItemPF2e) : value;
        }

        return this.finalizeValue(schemaInput, value);
    }

    finalizeValue(schemaInput: SchemaInputAdjacent, value: unknown): unknown {
        if (!this.isValidEntryValue(schemaInput, value)) {
            return this.getDefaultValue(schemaInput);
        }

        if (R.isString(value) && "field" in schemaInput && schemaInput.field?.trim !== false) {
            return (value as string).trim();
        }

        return value;
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

    async userQuery<T>(user: UserPF2e, data: object): Promise<T | null> {
        try {
            const result = await user.query(MODULE.path("user-query"), data, {
                timeout: USER_QUERY_TIMEOUT,
            });

            return (result as T) ?? null;
        } catch {
            return null;
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

type ExtractTextKey<S extends NodeRawSchema> = Extract<
    ExtractArrayUnion<S["inputs"]>,
    { type: "text" }
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

export { isUuidEntry, TriggerNode, USER_QUERY_TIMEOUT };
