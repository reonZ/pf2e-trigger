import {
    NODE_CUSTOM_TYPES,
    NODE_ENTRY_CATEGORIES,
    NODE_NONBRIDGE_TYPES,
    NodeCustomEntryType,
    NodeEntryCategory,
    NodeEntryType,
} from "data";
import { ArrayField, MODULE, R, SchemaField } from "module-helpers";
import {
    baseNodeSchemaEntry,
    NodeBridgeSchema,
    NodeBridgeSource,
    NodeInputField,
    NodeInputSource,
    NodeOutputSchema,
    NodeOutputSource,
    NodeSchemaIconField,
} from "schema";
import fields = foundry.data.fields;

const CUSTOM_KEY_TYPES = ["number", "text"] as const;

class NodeSchemaModel extends foundry.abstract.DataModel<null, NodeSchemaModelSchema> {
    static defineSchema(): NodeSchemaModelSchema {
        return {
            icon: new NodeSchemaIconField(),
            module: new fields.StringField({
                required: false,
                nullable: false,
                blank: false,
            }),
            custom: new fields.ArrayField(
                new fields.SchemaField({
                    category: new fields.StringField({
                        required: true,
                        nullable: false,
                        blank: false,
                        readonly: true,
                        choices: R.concat(NODE_ENTRY_CATEGORIES, ["outs"]),
                    }),
                    group: new fields.StringField({
                        required: false,
                        nullable: false,
                        blank: true,
                        readonly: true,
                        initial: "",
                    }),
                    types: new fields.ArrayField(
                        new fields.StringField({
                            required: true,
                            nullable: false,
                            blank: false,
                            choices: NODE_CUSTOM_TYPES,
                        }),
                        {
                            required: false,
                            nullable: false,
                            initial: () => NODE_CUSTOM_TYPES.slice(),
                        }
                    ),
                    key: new fields.SchemaField(
                        {
                            label: new fields.BooleanField({
                                required: false,
                                nullable: false,
                                initial: true,
                            }),
                            name: new fields.StringField({
                                required: true,
                                nullable: false,
                                blank: false,
                            }),
                            prefix: new fields.StringField({
                                required: false,
                                nullable: false,
                                blank: false,
                                trim: false,
                                initial: undefined,
                            }),
                            required: new fields.BooleanField({
                                required: false,
                                nullable: false,
                                initial: false,
                            }),
                            type: new fields.StringField({
                                required: false,
                                nullable: false,
                                blank: false,
                                choices: CUSTOM_KEY_TYPES,
                                initial: "text",
                            }),
                        },
                        {
                            required: false,
                            nullable: false,
                            initial: undefined,
                        }
                    ),
                }),
                {
                    required: false,
                    nullable: false,
                    initial: () => [],
                }
            ),
            await: new fields.BooleanField({
                required: false,
                nullable: false,
                initial: false,
            }),
            halt: new fields.BooleanField({
                required: false,
                nullable: false,
                initial: false,
            }),
            loop: new fields.BooleanField({
                required: false,
                nullable: false,
                initial: false,
            }),
            document: new fields.StringField({
                required: false,
                nullable: false,
                blank: false,
            }),
            image: new fields.StringField({
                required: false,
                nullable: false,
                blank: false,
            }),
            ...nodeSchemaEntries(),
        };
    }

    _initializeSource(
        data: object,
        options?: DataModelConstructionOptions<null> | undefined
    ): this["_source"] {
        const source = super._initializeSource(data, options);

        if (!R.isArray(source.outs) || !source.outs.length) {
            source.outs = [
                {
                    key: "out",
                    label: undefined,
                    type: "bridge",
                    group: "",
                    custom: false,
                },
            ];
        }

        for (const custom of source.custom) {
            if (custom.category === "outs") {
                custom.types = [];
            }
        }

        return source;
    }
}

function nodeSchemaEntries(): NodeSchemaEntriesSchema {
    return {
        outs: nodeSchemaEntry(
            new fields.StringField({
                required: false,
                nullable: false,
                blank: false,
                initial: "bridge",
                choices: ["bridge"],
            })
        ),
        inputs: new fields.ArrayField(new NodeInputField(), {
            required: false,
            nullable: false,
            initial: () => [],
        }),
        outputs: nodeSchemaEntry(
            new fields.StringField({
                required: true,
                nullable: false,
                blank: false,
                choices: NODE_NONBRIDGE_TYPES,
            })
        ),
    };
}

function nodeSchemaEntry<
    T extends fields.StringField<NodeEntryType, NodeEntryType, boolean, boolean, boolean>
>(typeField: T) {
    return new fields.ArrayField(
        new fields.SchemaField({
            ...baseNodeSchemaEntry(),
            type: typeField,
        }),
        {
            required: false,
            nullable: false,
            initial: () => [],
        }
    );
}

interface NodeSchemaModel
    extends foundry.abstract.DataModel<null, NodeSchemaModelSchema>,
        ModelPropsFromSchema<NodeSchemaModelSchema> {}

type NodeSchemaModelSchema = NodeSchemaEntriesSchema & {
    await: fields.BooleanField<boolean, boolean, false>;
    custom: ArrayField<SchemaField<NodeSchemaCustomSchema>>;
    document: fields.StringField<string, string, false, false, false>;
    halt: fields.BooleanField<boolean, boolean, false>;
    icon: NodeSchemaIconField;
    image: fields.StringField<string, string, false, false, false>;
    loop: fields.BooleanField<boolean, boolean, false>;
    module: fields.StringField<NodeSchemaModuleId, NodeSchemaModuleId, false, false, false>;
};

type NodeSchemaCustomSchema = {
    category: fields.StringField<NodeCustomEntryCategory, NodeCustomEntryCategory, true>;
    group: fields.StringField<string, string, false>;
    key: SchemaField<NodeSchemaCustomKeySchema, false>;
    types: ArrayField<fields.StringField<NodeCustomEntryType, NodeCustomEntryType, true>, false>;
};

type CustomKeyType = (typeof CUSTOM_KEY_TYPES)[number];

type NodeSchemaCustomKeySchema = {
    label: fields.BooleanField<boolean, boolean, false, false, true>;
    name: fields.StringField<string, string, true>;
    prefix: fields.StringField<string, string, false, false, false>;
    required: fields.BooleanField<boolean, boolean, false>;
    type: fields.StringField<CustomKeyType, CustomKeyType, false, false, true>;
};

type NodeSchemaCustom = NodeSchemaCustomInput | NodeSchemaCustomOutput | NodeSchemaCustomOut;

type BaseNodeSchemaCustom<T extends NodeCustomEntryCategory> = {
    category: T;
    group?: string;
    key?: {
        label?: boolean;
        name: string;
        prefix?: string;
        required?: boolean;
        type?: CustomKeyType;
    };
    types?: NodeCustomEntryType[];
};

type NodeSchemaCustomInput = BaseNodeSchemaCustom<"inputs">;
type NodeSchemaCustomOutput = BaseNodeSchemaCustom<"outputs">;
type NodeSchemaCustomOut = Omit<BaseNodeSchemaCustom<"outs">, "types" | "group">;

type NodeSchemaEntriesSchema = {
    outs: fields.ArrayField<fields.SchemaField<NodeBridgeSchema>>;
    inputs: fields.ArrayField<NodeInputField>;
    outputs: fields.ArrayField<fields.SchemaField<NodeOutputSchema>>;
};

type NodeSchemaEntriesSource = {
    outs?: NodeBridgeSource[];
    inputs?: NodeInputSource[];
    outputs?: NodeOutputSource[];
};

type NodeCustomEntryCategory = NodeEntryCategory | "outs";

type NodeSchemaModuleId = "pf2e-toolbelt";

type NodeSchemaSource = SourceFromSchema<NodeSchemaModelSchema>;

MODULE.devExpose({ NodeSchemaModel });

export { nodeSchemaEntries, NodeSchemaModel };
export type {
    NodeCustomEntryCategory,
    NodeSchemaCustom,
    NodeSchemaEntriesSchema,
    NodeSchemaEntriesSource,
    NodeSchemaModelSchema,
    NodeSchemaModuleId,
    NodeSchemaSource,
};
