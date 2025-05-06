import { isEntryCategory, NodeEntryCategory, TriggerNodeData } from "data";
import { MODULE } from "module-helpers";
import { NodeCustomEntryCategory } from "schema";
import { TriggerNode } from "trigger";
import fields = foundry.data.fields;
import { BlueprintNode } from "blueprint";

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
            readonly: true,
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

function segmentEntryId(id: NodeEntryId): SegmentedEntryId {
    const [nodeId, category, key] = id.split(".");
    return { nodeId, category, key } as SegmentedEntryId;
}

function createEntryId(
    node: TriggerNode | TriggerNodeData | BlueprintNode,
    category: NodeCustomEntryCategory,
    key: string
): NodeEntryId {
    const realCategory = category === "inputs" ? "inputs" : "outputs";
    return `${node.id}.${realCategory}.${key}`;
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

type SegmentedEntryId = {
    nodeId: string;
    category: NodeEntryCategory;
    key: string;
};

type NodeDataEntryIdFieldOptions<
    TSourceProp extends NodeEntryCategory,
    TRequired extends boolean,
    TNullable extends boolean,
    THasInitial extends boolean
> = fields.StringFieldOptions<TSourceProp, TRequired, TNullable, THasInitial> & {
    category?: NodeEntryCategory;
};

export { createEntryId, NodeEntryIdField, segmentEntryId };
export type { NodeEntryId };
