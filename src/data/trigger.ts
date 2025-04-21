import {
    isEventNode,
    TriggerNodeCollection,
    TriggerNodeData,
    TriggerNodeDataSchema,
    TriggerVariableField,
} from "data";
import {
    ArrayField,
    BooleanField,
    ExtendedCollectionDocument,
    ExtendedDocumentCollection,
    IdField,
    MODULE,
    R,
    RecordField,
    StringField,
} from "module-helpers";
import fields = foundry.data.fields;

class TriggerData
    extends foundry.abstract.Document<null, TriggerDataSchema>
    implements ExtendedCollectionDocument
{
    declare __collection: ExtendedDocumentCollection<this> | undefined;
    declare event: TriggerNodeData;
    declare nodes: TriggerNodeCollection;

    static defineSchema(): TriggerDataSchema {
        return {
            _id: new IdField(),
            name: new fields.StringField({
                required: false,
                nullable: false,
                initial: "",
            }),
            enabled: new fields.BooleanField({
                required: false,
                nullable: false,
                initial: true,
            }),
            variables: new fields.TypedObjectField(new TriggerVariableField(), {
                required: false,
                nullable: false,
            }),
            _nodes: new fields.ArrayField(new fields.SchemaField(TriggerNodeData.defineSchema()), {
                required: true,
                nullable: false,
                initial: [],
            }),
        };
    }

    static validateJoint(data: SourceFromSchema<TriggerDataSchema>): void {
        const events = data._nodes.filter(isEventNode);
        if (events.length < 1) {
            throw MODULE.Error(`doesn't have an event node`);
        } else if (events.length > 1) {
            throw MODULE.Error(`only one event node is permitted`);
        }
    }

    get label(): string {
        return this.name || this.id;
    }

    get isSubtrigger(): boolean {
        return this.event.type === "subtrigger";
    }

    get documentName(): string {
        return "Trigger";
    }

    get collectionName(): string {
        return "triggers";
    }

    async update(data: PartialTriggerDataSource): Promise<this | undefined> {
        data._id = this._id;
        this.__collection?.updateDocuments([data as EmbeddedDocumentUpdateData]);
        return this;
    }

    async delete(): Promise<this | undefined> {
        this.__collection?.delete(this.id);
        return this;
    }

    _initialize(options?: Record<string, unknown>) {
        super._initialize(options);

        this.nodes = new TriggerNodeCollection(this._source._nodes);
        this.event = this.nodes.find(isEventNode)!;
    }

    _initializeSource(data: object, options?: DataModelConstructionOptions<null>): this["_source"] {
        const source = super._initializeSource(data, options);

        if (!R.isArray(source._nodes) || !source._nodes.some(isEventNode)) {
            const node = new TriggerNodeData({ type: "event", key: "test-event" });
            source._nodes.unshift(node.toObject());
        }

        return source;
    }
}

interface TriggerData
    extends foundry.abstract.Document<null, TriggerDataSchema>,
        ModelPropsFromSchema<TriggerDataSchema> {}

type TriggerDataSource = SourceFromSchema<TriggerDataSchema>;
type PartialTriggerDataSource = DeepPartial<TriggerDataSource>;

type TriggerDataSchema = {
    _id: IdField;
    name: StringField;
    enabled: BooleanField<false>;
    variables: RecordField<TriggerVariableField, false>;
    _nodes: ArrayField<fields.SchemaField<TriggerNodeDataSchema>, true>;
};

MODULE.devExpose({ TriggerData });

export { TriggerData };
export type { PartialTriggerDataSource, TriggerDataSource };
