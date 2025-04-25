import fields = foundry.data.fields;

const NODE_ENTRY_TYPES = [
    "boolean",
    "dc",
    "duration",
    "item",
    "list",
    "number",
    "roll",
    "select",
    "target",
    "text",
    "bridge",
] as const;

const NODE_NONBRIDGE_TYPES = NODE_ENTRY_TYPES.filter((type) => type !== "bridge");

class NodeEntryTypeField<
    TEntryType extends NodeEntryType = NodeEntryType,
    TRequired extends boolean = true,
    TNullable extends boolean = false,
    THasInitial extends boolean = false
> extends fields.StringField<TEntryType, TEntryType, TRequired, TNullable, THasInitial> {
    static get _defaults() {
        return Object.assign(super._defaults, {
            required: true,
            nullable: false,
            blank: false,
            readonly: true,
            choices: NODE_ENTRY_TYPES,
            validationError: "is not a valid Node Entry Type string",
        });
    }
}

type NodeEntryType = (typeof NODE_ENTRY_TYPES)[number];
type NonBridgeEntryType = Exclude<NodeEntryType, "bridge">;

export { NODE_ENTRY_TYPES, NODE_NONBRIDGE_TYPES, NodeEntryTypeField };
export type { NodeEntryType, NonBridgeEntryType };
