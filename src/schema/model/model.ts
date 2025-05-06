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
                            name: new fields.StringField({
                                required: true,
                                nullable: false,
                                blank: false,
                            }),
                            required: new fields.BooleanField({
                                required: false,
                                nullable: false,
                                initial: false,
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
    icon: NodeSchemaIconField;
    module: fields.StringField<NodeSchemaModuleId, NodeSchemaModuleId, false, false, false>;
    custom: ArrayField<SchemaField<NodeSchemaCustomSchema>>;
    loop: fields.BooleanField<boolean, boolean, false>;
    document: fields.StringField<string, string, false, false, false>;
};

type NodeSchemaCustomSchema = {
    category: fields.StringField<NodeCustomEntryCategory, NodeCustomEntryCategory, true>;
    group: fields.StringField<string, string, false>;
    types: ArrayField<fields.StringField<NodeCustomEntryType, NodeCustomEntryType, true>, false>;
    key: SchemaField<NodeSchemaCustomKeySchema, false>;
};

type NodeSchemaCustomKeySchema = {
    name: fields.StringField<string, string, true>;
    required: fields.BooleanField<boolean, boolean, false>;
};

type NodeSchemaCustom = {
    category: NodeCustomEntryCategory;
    group?: string;
    types?: NodeCustomEntryType[];
    key?: {
        name: string;
        required?: boolean;
    };
};

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
