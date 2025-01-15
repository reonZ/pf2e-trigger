import { NodeEntryValue } from "@data/data-node";
import { R } from "module-helpers";

const NODE_TYPES = ["event", "condition", "value", "action", "logic"] as const;
const NODE_ENTRY_CATEGORIES = ["inputs", "outputs"] as const;
const NODE_ENTRY_TYPES = ["item", "boolean", "uuid", "text", "number", "select"] as const;

const ENTRY_VALUE_TYPE = {
    boolean: Boolean,
    number: Number,
    select: String,
    text: String,
    uuid: String,
    item: String,
};

function isInputConnection(
    schema: NodeSchemaInputEntry
): schema is NodeSchemaInputEntry & { type: Exclude<NodeEntryType, undefined> } {
    return !!schema.type && (schema.type === "item" || !schema.field);
}

function isInputSchema(schema: NodeSchemaInputEntry): schema is NonNullableInputEntry {
    return !!schema.type && schema.type !== "item";
}

function isInputValue(
    schema: NodeSchemaInputEntry,
    value: unknown
): value is string | number | boolean {
    if (
        !isInputSchema(schema) ||
        R.isNullish(value) ||
        value?.constructor !== ENTRY_VALUE_TYPE[schema.type]
    ) {
        return false;
    }

    switch (schema.type) {
        case "number": {
            if (isNaN(value)) return false;
            if (!R.isPlainObject(schema.field)) return true;

            return (
                value >= (schema.field.min ?? -Infinity) && value <= (schema.field.max ?? Infinity)
            );
        }

        case "select": {
            return !!getSelectOption(schema.field, value);
        }
    }

    return true;
}

function getSelectOption(
    field: NodeSchemaSelectField,
    value: string
): string | NodeSchemaSelectOption | undefined {
    const trimmed = value.trim();
    return field.options.find((option) =>
        R.isString(option) ? trimmed === option : option.value === trimmed
    );
}

function getDefaultInputValue(schema: NonNullableInputEntry): NonNullable<NodeEntryValue> {
    if (typeof schema.field === "object" && "default" in schema.field && schema.field.default) {
        return schema.field.default;
    }

    if (schema.type === "select") {
        const [option] = schema.field.options;
        return R.isPlainObject(option) ? option.value : option;
    }

    return new ENTRY_VALUE_TYPE[schema.type]() as NonNullable<NodeEntryValue>;
}

function setToSchemaValue(schema: NonNullableInputEntry, value: unknown): NodeEntryValue {
    if (!isInputSchema(schema) || R.isNullish(value)) {
        return getDefaultInputValue(schema);
    }

    const cast = ENTRY_VALUE_TYPE[schema.type](value) as any;

    switch (schema.type) {
        case "number": {
            if (isNaN(cast)) {
                return getDefaultInputValue(schema);
            }

            if (!R.isPlainObject(schema.field)) {
                return cast;
            }

            return Math.clamp(cast, schema.field.min ?? -Infinity, schema.field.max ?? Infinity);
        }

        case "text":
        case "uuid": {
            return cast.trim();
        }

        case "select": {
            return getSelectOption(schema.field, cast) ? cast.trim() : getDefaultInputValue(schema);
        }
    }

    return cast;
}

function isNodeType(type: any): type is NodeType {
    return R.isString(type) && NODE_TYPES.includes(type as NodeType);
}

function isEntryCategory(category: any): category is NodeEntryCategory {
    return R.isString(category) && NODE_ENTRY_CATEGORIES.includes(category as NodeEntryCategory);
}

function createBooleanSchemaOutputs(): BooleanSchemaOutputs {
    return [{ key: "true" }, { key: "false" }];
}

type NodeType = (typeof NODE_TYPES)[number];
type NodeEntryCategory = (typeof NODE_ENTRY_CATEGORIES)[number];
type NodeEntryType = (typeof NODE_ENTRY_TYPES)[number] | undefined;
type NonNullableNodeEntryType = Exclude<NodeEntryType, undefined | "item">;

type BaseNodeSchemaInputEntry<
    TType extends NodeEntryType,
    TField extends Record<string, any> | boolean = boolean
> = {
    key: string;
    label?: string;
    type: TType;
    field?: boolean | TField;
};

type NodeSchemaTextEntry = BaseNodeSchemaInputEntry<"text", NodeSchemaTextField>;
type NodeSchemaTextField = {
    default?: string;
};

type NodeSchemaUuidEntry = BaseNodeSchemaInputEntry<"uuid", NodeSchemaUuidField>;
type NodeSchemaUuidField = {};

type NodeSchemaItemEntry = BaseNodeSchemaInputEntry<"item">;

type NodeSchemaBooleanEntry = BaseNodeSchemaInputEntry<"boolean", NodeSchemaBooleanField>;
type NodeSchemaBooleanField = {
    default?: boolean;
};

type NodeSchemaNumberEntry = BaseNodeSchemaInputEntry<"number", NodeSchemaNumberField>;
type NodeSchemaNumberField = {
    min?: number;
    max?: number;
    step?: number;
    default?: number;
};

type NodeSchemaSelectEntry = Omit<
    BaseNodeSchemaInputEntry<"select", NodeSchemaSelectField>,
    "field"
> & {
    field: NodeSchemaSelectField;
};
type NodeSchemaSelectField = {
    options: (string | NodeSchemaSelectOption)[];
};
type NodeSchemaSelectOption = {
    value: string;
    label: string;
};

type NodeSchemaInputEntry =
    | NodeSchemaTextEntry
    | NodeSchemaUuidEntry
    | NodeSchemaItemEntry
    | NodeSchemaBooleanEntry
    | NodeSchemaNumberEntry
    | NodeSchemaSelectEntry;

type ExtractInputSchemaEntry<T extends NonNullable<NodeEntryType>> = Extract<
    NodeSchemaInputEntry,
    { type: T }
>;
type ExtractSchemaType<T extends NonNullable<NodeEntryType>> = PrimitiveOf<
    (typeof ENTRY_VALUE_TYPE)[T]
>;

type NodeSchemaOutputEntry = {
    key: string;
    label?: string;
    type?: NodeEntryType;
};

type NodeSchema = {
    isUnique?: boolean;
    in?: boolean;
    inputs?: NodeSchemaInputEntry[];
    outputs: NodeSchemaOutputEntry[];
};

type NonNullableInputEntry = NodeSchemaInputEntry & {
    type: Exclude<NodeEntryType, undefined | "item">;
};

type BooleanSchemaOutputs = [
    { key: "true"; label?: string | undefined },
    { key: "false"; label?: string | undefined }
];

export {
    createBooleanSchemaOutputs,
    getDefaultInputValue,
    getSelectOption,
    isEntryCategory,
    isInputConnection,
    isInputValue,
    isNodeType,
    setToSchemaValue,
};
export type {
    BooleanSchemaOutputs,
    ExtractInputSchemaEntry,
    ExtractSchemaType,
    NodeEntryCategory,
    NodeEntryType,
    NodeSchema,
    NodeSchemaBooleanEntry,
    NodeSchemaInputEntry,
    NodeSchemaItemEntry,
    NodeSchemaNumberEntry,
    NodeSchemaOutputEntry,
    NodeSchemaSelectEntry,
    NodeSchemaSelectField,
    NodeSchemaSelectOption,
    NodeSchemaTextEntry,
    NodeSchemaUuidEntry,
    NodeType,
    NonNullableInputEntry,
    NonNullableNodeEntryType,
};
