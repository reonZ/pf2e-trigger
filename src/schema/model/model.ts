import { NODE_NONBRIDGE_TYPES } from "data";
import { ArrayField, MODULE, R, StringField } from "module-helpers";
import { NodeBridgeSchema, NodeInputField, NodeSchemaIconField, NodeVariableSchema } from "schema";
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
                },
            ];
        }

        return source;
    }
}

function nodeSchemaEntries(): NodeSchemaEntries {
    return {
        outs: new fields.ArrayField(
            new fields.SchemaField({
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
                    required: false,
                    nullable: false,
                    initial: "bridge",
                    choices: ["bridge"],
                }),
            }),
            {
                required: false,
                nullable: false,
                initial: [],
            }
        ),
        inputs: new fields.ArrayField(new NodeInputField(), {
            required: false,
            nullable: false,
            initial: [],
        }),
        outputs: new fields.ArrayField(
            new fields.SchemaField({
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
            }),
            {
                required: false,
                nullable: false,
                initial: [],
            }
        ),
    };
}

interface NodeSchemaModel
    extends foundry.abstract.DataModel<null, NodeSchemaModelSchema>,
        ModelPropsFromSchema<NodeSchemaModelSchema> {}

type NodeSchemaModelSchema = NodeSchemaEntries & {
    icon: NodeSchemaIconField;
    module: StringField<NodeSchemaModuleId, false, false, false>;
};

type NodeSchemaEntries = {
    outs: ArrayField<fields.SchemaField<NodeBridgeSchema>>;
    inputs: ArrayField<NodeInputField>;
    outputs: ArrayField<fields.SchemaField<NodeVariableSchema>>;
};

type NodeSchemaModuleId = "pf2e-toolbelt";

type NodeSchemaSource = SourceFromSchema<NodeSchemaModelSchema>;

MODULE.devExpose({ NodeSchemaModel });

export { nodeSchemaEntries, NodeSchemaModel };
export type { NodeSchemaEntries, NodeSchemaModelSchema, NodeSchemaModuleId, NodeSchemaSource };
