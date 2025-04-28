import { NODE_NONBRIDGE_TYPES, NodeEntryType } from "data";
import { MODULE, R } from "module-helpers";
import {
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
                },
            ];
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
            group: new fields.StringField<string, string, false, false, true>({
                required: false,
                nullable: false,
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

type NodeSchemaModuleId = "pf2e-toolbelt";

type NodeSchemaSource = SourceFromSchema<NodeSchemaModelSchema>;

MODULE.devExpose({ NodeSchemaModel });

export { nodeSchemaEntries, NodeSchemaModel };
export type {
    NodeSchemaEntriesSchema,
    NodeSchemaEntriesSource,
    NodeSchemaModelSchema,
    NodeSchemaModuleId,
    NodeSchemaSource,
};
