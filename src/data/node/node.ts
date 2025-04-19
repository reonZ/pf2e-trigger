import {
    NodeEntryCategory,
    NodeEntryField,
    NodeType,
    TriggerData,
    TriggerNodeTypeField,
} from "data";
import {
    ExtendedCollectionDocument,
    ExtendedDocumentCollection,
    IdField,
    MODULE,
    PositionField,
    RecordField,
    SchemaField,
} from "module-helpers";
import { isValidNodeKey, NODE_KEYS, NodeKey, nodeSchemaEntries, NodeSchemaEntries } from "schema";
import fields = foundry.data.fields;

class TriggerNodeData
    extends foundry.abstract.Document<TriggerData, TriggerNodeDataSchema>
    implements ExtendedCollectionDocument
{
    declare __collection: ExtendedDocumentCollection<this> | undefined;

    static defineSchema(): TriggerNodeDataSchema {
        return {
            _id: new IdField(),
            type: new TriggerNodeTypeField(),
            key: new fields.StringField({
                required: true,
                nullable: false,
                blank: false,
                readonly: true,
                choices: NODE_KEYS,
            }),
            position: new PositionField(),
            subId: new fields.DocumentIdField({
                required: false,
                nullable: false,
                blank: false,
                initial: undefined,
                readonly: true,
            }),
            inputs: createEntryMap("outputs"),
            outputs: createEntryMap("inputs"),
            custom: new fields.SchemaField(nodeSchemaEntries(), {
                required: false,
                nullable: false,
            }),
        };
    }

    static validateJoint(data: SourceFromSchema<TriggerNodeDataSchema>): void {
        if (!isValidNodeKey(data.type, data.key)) {
            throw MODULE.Error(`'${data.key}' isn't a valid '${data.type}' key`);
        }
    }

    get documentName(): string {
        return "Node";
    }

    get collectionName(): string {
        return "nodes";
    }

    get isEvent(): boolean {
        return isEventNode(this);
    }

    async update(data: TriggerNodeDataSource): Promise<this | undefined> {
        data._id = this._id;
        this.__collection?.updateDocuments([data as EmbeddedDocumentUpdateData]);
        return this;
    }

    async delete(): Promise<this | undefined> {
        this.__collection?.delete(this.id);
        return this;
    }

    _initializeSource(
        data: Record<string, unknown>,
        options?: DocumentConstructionContext<TriggerData>
    ): this["_source"] {
        const source = super._initializeSource(data, options);

        if (isEventNode(source)) {
            source.position = { x: 100, y: 200 };
        }

        return source;
    }
}

function isEventNode(node: { type: NodeType; key: NodeKey }): boolean {
    return node.type === "event" || (node.type === "subtrigger" && node.key === "subtrigger-input");
}

function createEntryMap(category: NodeEntryCategory) {
    return new fields.TypedObjectField(new NodeEntryField(category), {
        required: false,
    });
}

interface TriggerNodeData
    extends foundry.abstract.Document<TriggerData, TriggerNodeDataSchema>,
        ModelPropsFromSchema<TriggerNodeDataSchema> {}

type TriggerNodeDataSchema = {
    _id: IdField;
    type: TriggerNodeTypeField;
    key: fields.StringField<NodeKey, NodeKey, true>;
    position: PositionField;
    subId: fields.DocumentIdField<string, false, false, false>;
    inputs: RecordField<NodeEntryField, false>;
    outputs: RecordField<NodeEntryField, false>;
    custom: SchemaField<NodeSchemaEntries, false>;
};

type TriggerNode = WithPartial<TriggerNodeData, "custom">;

type TriggerNodeDataSource = Omit<
    DeepPartial<SourceFromSchema<TriggerNodeDataSchema>>,
    "type" | "key"
> & {
    type: NodeType;
    key: NodeKey;
};

MODULE.devExpose({ TriggerNodeData });

export { isEventNode, TriggerNodeData };
export type { TriggerNode, TriggerNodeDataSchema, TriggerNodeDataSource };
