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
                }),
                new fields.ArrayField<SelectArrayOption>(
                    new DataUnionField(
                        [
                            new fields.StringField<string, string>({
                                required: false,
                                nullable: false,
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
                group: new fields.StringField({
                    required: false,
                    nullable: false,
                    initial: "",
                }),
                key: new fields.StringField({
                    required: true,
                    nullable: false,
                    blank: false,
                }),
                label: new fields.StringField({
                    required: false,
                    nullable: false,
                }),
                type: new fields.StringField({
                    required: true,
                    nullable: false,
                    choices: NODE_NONBRIDGE_TYPES,
                }),
                connection: new fields.BooleanField({
                    required: false,
                    nullable: false,
                    initial: true,
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
                        code: new fields.BooleanField({
                            required: false,
                            nullable: false,
                            initial: false,
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

        switch (data.type) {
            case "number": {
                if (!R.isNumber(defaultValue)) {
                    throw MODULE.Error(`field.default of '${data.key}' must be a number`);
                }
                break;
            }

            case "boolean": {
                if (!R.isBoolean(defaultValue)) {
                    throw MODULE.Error(`field.default of '${data.key}' must be a boolean`);
                }
                break;
            }

            case "text": {
                if (!R.isString(defaultValue)) {
                    throw MODULE.Error(`field.default of '${data.key}' must be a string`);
                }
                break;
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

function entrySchemaIsOfType<T extends NodeEntryType>(
    schema: NodeRawSchemaEntry<NodeEntryType>,
    type: T
): schema is T extends keyof SchemaEntries ? SchemaEntries[T] : never {
    return schema.type === type;
}

type NodeEntrySchema<TType extends NodeEntryType, TRequired extends boolean = true> = {
    key: fields.StringField<string, string, true>;
    label: fields.StringField<string, string, false, false, false>;
    type: fields.StringField<TType, TType, TRequired>;
};

type NonBridgeEntrySchema = NodeEntrySchema<NonBridgeEntryType> & {
    group: fields.StringField;
};

type NodeBridgeSchema = NodeEntrySchema<"bridge", false>;

type NodeVariableSchema = NonBridgeEntrySchema;

type NodeInputSchema = NonBridgeEntrySchema & {
    connection: fields.BooleanField<boolean, boolean, false>;
    field: SchemaField<NodeInputFieldSchema, false, false, false>;
};

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
    code: fields.BooleanField<boolean, boolean, false>;
};

type SelectArrayOption = DataUnionField<
    fields.StringField | SelectOptionField<false>,
    SelectOptions,
    false,
    false,
    false
>;

export { NodeInputField, entrySchemaIsOfType };
export type { NodeBridgeSchema, NodeInputSchema, NodeVariableSchema, NonBridgeEntrySchema };
