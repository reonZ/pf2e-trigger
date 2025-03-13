export {};

declare global {
    type BaseNodeSchemaInputEntry<
        TType extends NonNullable<NodeEntryType> = NonNullable<NodeEntryType>,
        TField extends Record<string, any> | boolean | never = never
    > = {
        key: string;
        label?: string;
        type: TType;
        connection?: boolean;
        field?: TField extends Record<string, any>
            ? TField | boolean
            : TField extends boolean
            ? boolean
            : never;
    };

    type NodeSchemaInput =
        | NodeSchemaText
        | NodeSchemaNumber
        | NodeSchemaBoolean
        | NodeSchemaUuid
        | NodeSchemaTarget
        | NodeSchemaSelect
        | NodeSchemaItem
        | NodeSchemaRoll
        | NodeSchemaDc
        | NodeSchemaDuration
        | NodeSchemaLabel;

    type NodeSchemaText = BaseNodeSchemaInputEntry<"text", NodeSchemaTextField>;
    type NodeSchemaTextField = {
        default?: string;
    };

    type NodeSchemaNumber = BaseNodeSchemaInputEntry<"number", NodeSchemaNumberField>;
    type NodeSchemaNumberField = {
        min?: number;
        max?: number;
        step?: number;
        default?: number;
    };

    type NodeSchemaBoolean = BaseNodeSchemaInputEntry<"boolean", NodeSchemaBooleanField>;
    type NodeSchemaBooleanField = {
        default?: boolean;
    };

    type NodeSchemaLabel = BaseNodeSchemaInputEntry<"label">;

    type NodeSchemaTarget = BaseNodeSchemaInputEntry<"target">;
    type NodeSchemaItem = BaseNodeSchemaInputEntry<"item">;
    type NodeSchemaRoll = BaseNodeSchemaInputEntry<"roll">;
    type NodeSchemaDc = BaseNodeSchemaInputEntry<"dc">;
    type NodeSchemaDuration = BaseNodeSchemaInputEntry<"duration">;

    type NodeSchemaUuid = BaseNodeSchemaInputEntry<"uuid", boolean>;

    type NodeSchemaSelect = Omit<
        BaseNodeSchemaInputEntry<"select", NodeSchemaSelectField>,
        "field"
    > & {
        field: NodeSchemaSelectField;
    };
    type NodeSchemaSelectField = {
        default?: string;
        options: (string | NodeSchemaSelectOption)[] | string;
    };
    type NodeSchemaSelectOption = {
        value: string;
        label: string;
    };
}
