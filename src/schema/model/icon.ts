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
                        readonly: true,
                    }),
                    fontWeight: new fields.StringField<
                        TextStyleFontWeight,
                        TextStyleFontWeight,
                        true
                    >({
                        required: true,
                        nullable: false,
                        blank: false,
                        readonly: true,
                    }),
                    replace: new fields.StringField<string, string, false, false, false>({
                        required: false,
                        nullable: false,
                        blank: true,
                        readonly: true,
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
                replace: undefined,
            } satisfies IconObject;
        }

        return value;
    }
}

type IconObjectSchema = {
    unicode: fields.StringField<string, string, true>;
    fontWeight: fields.StringField<TextStyleFontWeight, TextStyleFontWeight, true>;
    replace: fields.StringField<string, string, false, false, false>;
};

type IconObject = WithPartial<ModelPropsFromSchema<IconObjectSchema>, "replace">;

export { NodeSchemaIconField };
export type { IconObject };
