import { MODULE } from "module-helpers";
import { isEntryCategory, NODE_ENTRY_TYPES, NodeEntryCategory } from "data";
import fields = foundry.data.fields;

class NodeEntryIdField<
    TCategory extends NodeEntryCategory = NodeEntryCategory,
    TRequired extends boolean = true,
    TNullable extends boolean = false,
    THasInitial extends boolean = false
> extends fields.StringField<TCategory, NodeEntryId, TRequired, TNullable, THasInitial> {
    constructor(
        options?: NodeDataEntryIdFieldOptions<TCategory, TRequired, TNullable, THasInitial>,
        context?: fields.DataFieldContext
    ) {
        super(options, context);
    }

    static get _defaults() {
        return Object.assign(super._defaults, {
            required: true,
            blank: false,
            readonly: true,
            choices: NODE_ENTRY_TYPES,
            validationError: "is not a valid Node Entry ID string",
        });
    }

    protected override _validateType(value: string): boolean | void {
        super._validateType(value);

        const seg = value.split(".");
        const category = seg[1];

        if (seg.length !== 3 || !isEntryCategory(category)) {
            throw MODULE.Error("is not a valid Node Entry ID string");
        }

        if (this.options.category && this.options.category !== category) {
            throw MODULE.Error(`must be a Node Entry ID of category '${this.options.category}'`);
        }
    }
}

interface NodeEntryIdField<
    TCategory extends NodeEntryCategory = NodeEntryCategory,
    TRequired extends boolean = true,
    TNullable extends boolean = false,
    THasInitial extends boolean = false
> extends fields.StringField<TCategory, NodeEntryId, TRequired, TNullable, THasInitial> {
    options: NodeDataEntryIdFieldOptions<TCategory, TRequired, TNullable, THasInitial>;
}

type NodeEntryOutputId = `${string}.outputs.${string}`;
type NodeEntryInputId = `${string}.inputs.${string}`;
type NodeEntryId = NodeEntryInputId | NodeEntryOutputId;

type NodeDataEntryIdFieldOptions<
    TSourceProp extends NodeEntryCategory,
    TRequired extends boolean,
    TNullable extends boolean,
    THasInitial extends boolean
> = fields.StringFieldOptions<TSourceProp, TRequired, TNullable, THasInitial> & {
    category?: NodeEntryCategory;
};

export type { NodeEntryId };
export { NodeEntryIdField };
