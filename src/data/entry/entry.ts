import { NodeEntryIdField, NodeEntryValueField } from "data";
import { ArrayField } from "module-helpers";
import { NodeEntryCategory } from "./_utils";
import fields = foundry.data.fields;

class NodeEntryField<
    TRequired extends boolean = true,
    TNullable extends boolean = false,
    THasInitial extends boolean = true,
    TSourceProp extends SourceFromSchema<NodeEntryFieldSchema> = SourceFromSchema<NodeEntryFieldSchema>
> extends fields.SchemaField<
    NodeEntryFieldSchema,
    TSourceProp,
    ModelPropsFromSchema<NodeEntryFieldSchema>,
    TRequired,
    TNullable,
    THasInitial
> {
    constructor(
        category?: NodeEntryCategory,
        options?: fields.DataFieldOptions<TSourceProp, TRequired, TNullable, THasInitial>,
        context?: fields.DataFieldContext
    ) {
        super(
            {
                ids: new fields.ArrayField(new NodeEntryIdField({ category }), { initial: [] }),
                value: new NodeEntryValueField(),
            },
            options,
            context
        );
    }
}

type NodeEntryFieldSchema = {
    ids: ArrayField<NodeEntryIdField, false, false, true>;
    value: NodeEntryValueField;
};

type TriggerEntryData = ModelPropsFromSchema<NodeEntryFieldSchema>;

export { NodeEntryField };
export type { TriggerEntryData };
