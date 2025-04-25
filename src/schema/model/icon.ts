import { DataUnionField, R, SchemaField } from "module-helpers";
import fields = foundry.data.fields;

class NodeSchemaIconField extends DataUnionField<
    fields.StringField | SchemaField<IconObjectSchema, false, false, false>,
    IconObject,
    false,
    false,
    true
> {
    constructor() {
        super([
            new fields.StringField<string>({
                required: false,
                nullable: false,
                blank: false,
            }),
            new fields.SchemaField<
                IconObjectSchema,
                SourceFromSchema<IconObjectSchema>,
                ModelPropsFromSchema<IconObjectSchema>,
                false,
                false,
                false
            >(
                {
                    unicode: new fields.StringField<string, string, true>({
                        required: true,
                        nullable: false,
                        blank: false,
                    }),
                    fontWeight: new fields.StringField<
                        TextStyleFontWeight,
                        TextStyleFontWeight,
                        true
                    >({
                        required: true,
                        nullable: false,
                    }),
                },
                {
                    required: false,
                    nullable: false,
                }
            ),
        ]);
    }

    _cast(value?: unknown): unknown {
        if (R.isString(value)) {
            return {
                unicode: value,
                fontWeight: "400",
            } satisfies IconObject;
        }

        return value;
    }
}

type IconObjectSchema = {
    unicode: fields.StringField<string, string, true>;
    fontWeight: fields.StringField<TextStyleFontWeight, TextStyleFontWeight, true>;
};

type IconObject = ModelPropsFromSchema<IconObjectSchema>;

export { NodeSchemaIconField };
export type { IconObject };
