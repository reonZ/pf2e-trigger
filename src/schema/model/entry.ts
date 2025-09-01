import { NODE_NONBRIDGE_TYPES, NodeEntryType, NonBridgeEntryType } from "data";
import {
    ArrayField,
    DataUnionField,
    MODULE,
    R,
    SchemaField,
    SelectOptionField,
} from "module-helpers";
import { NodeRawSchemaEntry, SchemaEntries } from "schema";
import fields = foundry.data.fields;

const NODE_INPUT_TEXT_TYPES = ["code", "description"] as const;

class NodeInputOptionsField extends DataUnionField<
    fields.StringField | ArrayField<SelectArrayOption>,
    SelectOptions,
    false,
    false,
    false
> {
    static recursive = true;

    constructor() {
        super(
            [
                new fields.StringField<string, string>({
                    required: false,
                    nullable: false,
                    blank: false,
                }),
                new fields.ArrayField<SelectArrayOption>(
                    new DataUnionField(
                        [
                            new fields.StringField<string, string>({
                                required: false,
                                nullable: false,
                                blank: false,
                            }),
                            new SelectOptionField({
                                required: false,
                                nullable: false,
                            }),
                        ],
                        {
                            required: false,
                            nullable: false,
                        }
                    ),
                    {
                        required: false,
                        nullable: false,
                    }
                ),
            ],
            {
                required: false,
                nullable: false,
            }
        );
    }

    static get _defaults() {
        return Object.assign(super._defaults, {
            required: false,
            nullable: false,
        });
    }

    _cast(value?: unknown): unknown {
        if (R.isString(value)) {
            const cursor = foundry.utils.getProperty(window, value);

            if (!R.isObjectType<Record<string, string>>(cursor)) {
                return undefined;
            }

            return R.pipe(
                cursor,
                R.entries(),
                R.map(([value, label]) => {
                    return { value, label };
                })
            ) satisfies SelectOptions;
        } else if (R.isArray(value)) {
            return R.pipe(
                value,
                R.map((entry) => {
                    return R.isString(entry) ? { value: entry } : (entry as SelectOption);
                }),
                R.filter(R.isTruthy)
            ) satisfies SelectOptions;
        }

        return value;
    }
}

class NodeInputField<
    TSourceProp extends SourceFromSchema<NodeInputSchema> = SourceFromSchema<NodeInputSchema>
> extends fields.SchemaField<
    NodeInputSchema,
    TSourceProp,
    ModelPropsFromSchema<NodeInputSchema>,
    false,
    false,
    true
> {
    constructor() {
        super(
            {
                ...baseNodeSchemaEntry(),
                type: new fields.StringField({
                    required: true,
                    nullable: false,
                    blank: false,
                    choices: NODE_NONBRIDGE_TYPES,
                }),
                field: new fields.SchemaField(
                    {
                        min: new fields.NumberField({
                            required: false,
                            nullable: false,
                        }),
                        max: new fields.NumberField({
                            required: false,
                            nullable: false,
                        }),
                        step: new fields.NumberField({
                            required: false,
                            nullable: false,
                            step: 1,
                        }),
                        default: new DataUnionField(
                            [
                                new fields.StringField<string, string>({
                                    required: false,
                                    nullable: false,
                                }),
                                new fields.NumberField<number, number, false, false>({
                                    required: false,
                                    nullable: false,
                                }),
                                new fields.BooleanField<boolean, boolean, false>({
                                    required: false,
                                    nullable: false,
                                }),
                            ],
                            {
                                required: false,
                                nullable: false,
                            }
                        ),
                        options: new NodeInputOptionsField(),
                        trim: new fields.BooleanField({
                            required: false,
                            nullable: false,
                            initial: undefined,
                        }),
                        type: new fields.StringField({
                            required: false,
                            nullable: false,
                            choices: NODE_INPUT_TEXT_TYPES,
                            initial: undefined,
                        }),
                        document: new fields.StringField({
                            required: false,
                            nullable: false,
                            readonly: true,
                            choices: ["Item", "Macro"],
                        }),
                    },
                    {
                        required: false,
                        nullable: false,
                    }
                ),
            },
            {
                required: false,
                nullable: false,
            }
        );
    }

    _validateType(
        data: TSourceProp,
        options?: fields.DataFieldValidationOptions
    ): boolean | foundry.data.validation.DataModelValidationFailure | void {
        const validation = super._validateType(data, options);
        const defaultValue = data.field?.default;
        const defaultIsNullish = R.isNullish(defaultValue);

        if (data.type === "select") {
            if (!data.field?.options?.length) {
                throw MODULE.Error(`'select' input '${data.key}' requires a field with options`);
            }

            if (!defaultIsNullish) {
                if (!R.isString(defaultValue)) {
                    throw MODULE.Error(`field.default of '${data.key}' must be a string`);
                }

                const options = data.field.options as SelectOptions;
                if (!options.find((option) => option.value === defaultValue)) {
                    throw MODULE.Error(`'${defaultValue}' is not a valid option for '${data.key}'`);
                }
            }
        }

        if (defaultIsNullish) {
            return validation;
        }

        const type = data.type;
        if (type === "boolean") {
            if (!R.isBoolean(defaultValue)) {
                throw MODULE.Error(`field.default of '${data.key}' must be a boolean`);
            }
        } else if (type === "number") {
            if (!R.isNumber(defaultValue)) {
                throw MODULE.Error(`field.default of '${data.key}' must be a number`);
            }
        } else if (type === "text") {
            if (!R.isString(defaultValue)) {
                throw MODULE.Error(`field.default of '${data.key}' must be a string`);
            }
        }

        return validation;
    }

    initialize(
        value: unknown,
        model?: ConstructorOf<foundry.abstract.DataModel>,
        options?: Record<string, unknown>
    ): ModelPropsFromSchema<NodeInputSchema> {
        const source = super.initialize(value, model, options);

        if (source.type === "select" && source.field?.options?.length && !source.field.default) {
            source.field.default = source.field.options[0].value;
        }

        return source;
    }
}

function baseNodeSchemaEntry() {
    return {
        custom: new fields.BooleanField<boolean, boolean, false>({
            required: false,
            nullable: false,
            initial: false,
        }),
        group: new fields.StringField<string, string, false, false, true>({
            required: false,
            nullable: false,
            readonly: true,
            initial: "",
        }),
        key: new fields.StringField<string, string, true, false, true>({
            required: true,
            nullable: false,
            blank: false,
        }),
        label: new fields.StringField<string, string, false, false, false>({
            required: false,
            nullable: false,
        }),
    };
}

function entrySchemaIsOfType<T extends NodeEntryType>(
    schema: NodeRawSchemaEntry<NodeEntryType>,
    type: T
): schema is T extends keyof SchemaEntries ? SchemaEntries[T] : never {
    return schema.type === type;
}

type NodeSchemaEntry = WithRequired<BaseNodeSchemaEntry, "label">;

type NodeEntrySchema<TType extends NodeEntryType, TRequired extends boolean = true> = {
    key: fields.StringField<string, string, true>;
    label: fields.StringField<string, string, false, false, false>;
    type: fields.StringField<TType, TType, TRequired>;
    group: fields.StringField;
    custom: fields.BooleanField<boolean, boolean, false>;
};

type BaseNodeSchemaEntry<TType extends NodeEntryType = NodeEntryType> = {
    key: string;
    type: TType;
    label?: string;
    group?: string;
    custom?: boolean;
};

type NodeBridgeSchema = NodeEntrySchema<"bridge", false>;
type NodeBridgeSource = BaseNodeSchemaEntry<"bridge">;

type NodeOutputSchema = NodeEntrySchema<NonBridgeEntryType>;
type NodeOutputSource = BaseNodeSchemaEntry;

type NodeInputSchema = NodeEntrySchema<NonBridgeEntryType> & {
    field: SchemaField<NodeInputFieldSchema, false, false, false>;
};

type NodeFieldSchema = Partial<ModelPropsFromSchema<NodeInputFieldSchema>>;

type NodeInputFieldSchema = {
    min: fields.NumberField<number, number, false, false, false>;
    max: fields.NumberField<number, number, false, false, false>;
    step: fields.NumberField<number, number, false, false, false>;
    default: DataUnionField<
        | fields.BooleanField<boolean, boolean, false>
        | fields.NumberField<number, number, false, false>
        | fields.StringField<string, string, false>,
        boolean | number | string,
        false,
        false,
        true
    >;
    options: NodeInputOptionsField;
    trim: fields.BooleanField<boolean, boolean, false, false>;
    type: fields.StringField<NodeInputFieldType, NodeInputFieldType, false, false, true>;
    document: fields.StringField<"Item" | "Macro", "Item" | "Macro", false, false, false>;
};

type NodeInputSource = BaseNodeSchemaEntry & {
    field?: {
        min?: number;
        max?: number;
        step?: number;
        default?: string | number | boolean;
        options?: string | (SelectOption | string)[];
        trim?: boolean;
        type?: NodeInputFieldType;
        document?: "Item" | "Macro";
    };
};

type SelectArrayOption = DataUnionField<
    fields.StringField | SelectOptionField<false>,
    SelectOptions,
    false,
    false,
    false
>;

type NodeTextInputType = (typeof NODE_INPUT_TEXT_TYPES)[number];

type NodeInputFieldType = NodeTextInputType;

export { baseNodeSchemaEntry, entrySchemaIsOfType, NodeInputField };
export type {
    BaseNodeSchemaEntry,
    NodeBridgeSchema,
    NodeBridgeSource,
    NodeFieldSchema,
    NodeInputSchema,
    NodeInputSource,
    NodeOutputSchema,
    NodeOutputSource,
    NodeSchemaEntry,
    NodeTextInputType,
};
