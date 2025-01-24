import { NodeEntryValue } from "data/data-node";
import { ItemPF2e, MacroPF2e, R } from "module-helpers";

const NODE_TYPES = ["event", "condition", "value", "action", "logic", "variable"] as const;
const NODE_ENTRY_CATEGORIES = ["inputs", "outputs"] as const;
const NODE_ENTRY_TYPES = [
    "target",
    "item",
    "macro",
    "boolean",
    "uuid",
    "text",
    "number",
    "select",
    "roll",
] as const;

const NULL_NODE_ENTRY_TYPES = ["target", "item", "macro", "roll"] as const;

const ENTRY_VALUE_TYPE = {
    boolean: Boolean,
    number: Number,
    select: String,
    text: String,
    uuid: String,
} satisfies Record<
    NonNullableNodeEntryType,
    StringConstructor | NumberConstructor | BooleanConstructor
>;

function isNullNodeType(type: NodeEntryType): type is NullNodeEntryType {
    return NULL_NODE_ENTRY_TYPES.includes(type as any);
}

function isInputConnection(
    schema: NodeSchemaInputEntry
): schema is NodeSchemaInputEntry & { type: Exclude<NodeEntryType, undefined> } {
    return !!schema.type && (isNullNodeType(schema.type) || !schema.field);
}

function isInputSchemaEntry(schema: NodeSchemaInputEntry): schema is NonNullableInputEntry {
    return !!schema.type && !isNullNodeType(schema.type);
}

function isInputValue(
    schema: NodeSchemaInputEntry,
    value: unknown
): value is string | number | boolean {
    if (
        !isInputSchemaEntry(schema) ||
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

    return new ENTRY_VALUE_TYPE[schema.type]().valueOf();
}

function setToSchemaValue(schema: NonNullableInputEntry, value: unknown): NodeEntryValue {
    if (!isInputSchemaEntry(schema) || R.isNullish(value)) {
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
type NullNodeEntryType = (typeof NULL_NODE_ENTRY_TYPES)[number];
type NonNullableNodeEntryType = Exclude<NodeEntryType, undefined | NullNodeEntryType>;

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

type NodeSchemaTargetEntry = BaseNodeSchemaInputEntry<"target">;

type NodeSchemaItemEntry = BaseNodeSchemaInputEntry<"item">;

type NodeSchemaMacroEntry = BaseNodeSchemaInputEntry<"macro">;

type NodeSchemaRollEntry = BaseNodeSchemaInputEntry<"roll">;

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
    default?: string;
    options: (string | NodeSchemaSelectOption)[];
};
type NodeSchemaSelectOption = {
    value: string;
    label: string;
};

type NodeSchemaInputEntry =
    | NodeSchemaTextEntry
    | NodeSchemaUuidEntry
    | NodeSchemaTargetEntry
    | NodeSchemaItemEntry
    | NodeSchemaMacroEntry
    | NodeSchemaBooleanEntry
    | NodeSchemaNumberEntry
    | NodeSchemaSelectEntry
    | NodeSchemaRollEntry;

type RollNodeEntry = {
    origin: TargetDocuments | undefined;
    item: ItemPF2e | undefined;
    options: string[];
    traits: string[];
};

type ExtractInputSchemaEntry<T extends NonNullable<NodeEntryType>> = Extract<
    NodeSchemaInputEntry,
    { type: T }
>;

type ExtractSchemaEntryType<T extends NodeEntryType> = T extends NonNullableNodeEntryType
    ? PrimitiveOf<(typeof ENTRY_VALUE_TYPE)[T]>
    : T extends NullNodeEntryType
    ? ExtractNullEntryType<T> | undefined
    : never;

type ExtractNullEntryType<T extends NullNodeEntryType> = T extends "item"
    ? ItemPF2e
    : T extends "macro"
    ? MacroPF2e
    : T extends "target"
    ? TargetDocuments
    : T extends "roll"
    ? RollNodeEntry
    : never;

type ExtractSchemaInputsKeys<S extends NodeSchema> = S extends {
    inputs?: { key: infer K extends string }[];
}
    ? K
    : never;

type ExtractSchemaOuputsKeys<S extends NodeSchema> = S extends {
    outputs: { key: infer K extends string }[];
}
    ? K
    : never;

type ExtractSchemaVariableType<S extends NodeSchema> = S extends {
    variables?: { key: infer K extends string }[];
}
    ? K
    : never;

type NodeSchemaOutputEntry = {
    key: string;
    label?: string;
    type?: NodeEntryType;
};

type BridgeNodeEntry = {
    key: string;
    label?: string;
};

type NodeSchema = {
    unique?: boolean | string[];
    in?: boolean;
    inputs?: NodeSchemaInputEntry[];
    outputs: NodeSchemaOutputEntry[];
    variables?: NodeSchemaVariable[];
};

type NodeSchemaVariable = { key: string; label?: string; type: Required<NodeEntryType> };

type NonNullableInputEntry = NodeSchemaInputEntry & {
    type: NonNullableNodeEntryType;
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
    isInputSchemaEntry,
    isInputValue,
    isNodeType,
    setToSchemaValue,
};
export type {
    BooleanSchemaOutputs,
    BridgeNodeEntry,
    ExtractInputSchemaEntry,
    ExtractSchemaEntryType,
    ExtractSchemaInputsKeys,
    ExtractSchemaOuputsKeys,
    ExtractSchemaVariableType,
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
    NodeSchemaVariable,
    NodeType,
    NonNullableInputEntry,
    NonNullableNodeEntryType,
    RollNodeEntry,
};
