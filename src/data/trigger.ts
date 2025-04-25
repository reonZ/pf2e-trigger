import {
    isEventNode,
    NodeEntryId,
    PartialTriggerNodeDataSource,
    TriggerNodeData,
    TriggerVariableField,
} from "data";
import { IdField, makeModuleDocument, MODULE, R, RecordField } from "module-helpers";
import fields = foundry.data.fields;
import abstract = foundry.abstract;

const triggerDataMetadata = (): Partial<abstract.DocumentClassMetadata> => ({
    name: "Trigger",
    collection: "triggers",
    indexed: true,
    embedded: { Node: "nodes" },
    hasTypeData: true,
    label: "Trigger",
    schemaVersion: "2.0.0",
});

const triggerDataSchema = (): TriggerDataSchema => ({
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
    nodes: new fields.EmbeddedCollectionField(TriggerNodeData),
    variables: new fields.TypedObjectField(new TriggerVariableField(), {
        required: false,
        nullable: false,
    }),
});

class TriggerData extends makeModuleDocument<abstract._Document, TriggerDataSchema>(
    triggerDataMetadata,
    triggerDataSchema
) {
    declare event: TriggerNodeData;

    static validateJoint(data: SourceFromSchema<TriggerDataSchema>) {
        const events = data.nodes.filter(isEventNode);
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

    getNode(id: NodeEntryId): TriggerNodeData | undefined {
        return this.nodes.get(id.split(".")[0]);
    }

    _initializeSource(
        data: object,
        options?: DataModelConstructionOptions<abstract._Document> | undefined
    ): this["_source"] {
        const source = super._initializeSource(data, options);

        if (!R.isArray(source.nodes) || !source.nodes.some(isEventNode)) {
            const node = new TriggerNodeData({ type: "event", key: "test-event" });
            source.nodes.unshift(node.toObject());
        }

        return source;
    }

    _initialize(options?: Record<string, unknown>) {
        super._initialize(options);
        this.event = this.nodes.find(isEventNode)!;
    }
}

interface TriggerData {
    createEmbeddedDocuments(
        embeddedName: "Node",
        data: PartialTriggerNodeDataSource[],
        operation?: Partial<DatabaseCreateOperation<TriggerData>>
    ): Promise<TriggerNodeData[]>;
}

type TriggerDataSchema = {
    _id: IdField;
    name: fields.StringField<string, string, false, false, true>;
    enabled: fields.BooleanField<boolean, boolean, false, false, true>;
    nodes: fields.EmbeddedCollectionField<TriggerNodeData>;
    variables: RecordField<TriggerVariableField, false>;
};

type TriggerDataSource = SourceFromSchema<TriggerDataSchema>;

type PartialTriggerDataSource = Omit<DeepPartial<TriggerDataSource>, "nodes"> & {
    nodes?: PartialTriggerNodeDataSource[];
};

MODULE.devExpose({ TriggerData });

export { TriggerData };
export type { PartialTriggerDataSource };
