import fields = foundry.data.fields;

const NODE_TYPES = [
    "event",
    "action",
    "condition",
    "logic",
    "splitter",
    "value",
    "variable",
    "macro",
    "subtrigger",
] as const;

class TriggerNodeTypeField<
    TSourceProp extends NodeType = NodeType,
    TModelProp extends NonNullable<JSONValue> = TSourceProp,
    TRequired extends boolean = true,
    TNullable extends boolean = false,
    THasInitial extends boolean = false
> extends fields.StringField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
    static get _defaults() {
        return Object.assign(super._defaults, {
            required: true,
            nullable: false,
            blank: false,
            readonly: true,
            choices: NODE_TYPES,
            validationError: "is not a valid Node Type string",
        });
    }
}

type NodeType = (typeof NODE_TYPES)[number];

export { TriggerNodeTypeField };
export type { NodeType };
