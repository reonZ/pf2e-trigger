import { NodeEntryTypeField } from "data";
import fields = foundry.data.fields;

class TriggerVariableField<
    TRequired extends boolean = true,
    TNullable extends boolean = false,
    THasInitial extends boolean = true
> extends fields.SchemaField<
    TriggerVariableSchema,
    SourceFromSchema<TriggerVariableSchema>,
    ModelPropsFromSchema<TriggerVariableSchema>,
    TRequired,
    TNullable,
    THasInitial
> {
    constructor() {
        super({
            label: new fields.StringField({
                required: true,
                nullable: false,
                blank: false,
            }),
            type: new NodeEntryTypeField(),
        });
    }
}

interface TriggerVariableField<
    TRequired extends boolean = true,
    TNullable extends boolean = false,
    THasInitial extends boolean = true
> extends fields.SchemaField<
            TriggerVariableSchema,
            SourceFromSchema<TriggerVariableSchema>,
            ModelPropsFromSchema<TriggerVariableSchema>,
            TRequired,
            TNullable,
            THasInitial
        >,
        ModelPropsFromSchema<TriggerVariableSchema> {}

type TriggerVariableSchema = {
    label: fields.StringField<string, string, true>;
    type: NodeEntryTypeField;
};

export { TriggerVariableField };
