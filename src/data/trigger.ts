import {
    isEventNode,
    NODE_NONBRIDGE_TYPES,
    NodeEntryId,
    NonBridgeEntryType,
    TriggerNodeData,
    TriggerNodeDataSource,
} from "data";
import { IdField, localize, makeModuleDocument, MODULE, ModuleDocument, R } from "module-helpers";
import fields = foundry.data.fields;
import abstract = foundry.abstract;
import { isVariable } from "schema";

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
    variables: new fields.TypedObjectField(
        new fields.SchemaField<TriggerVariableSchema>({
            label: new fields.StringField({
                required: true,
                nullable: false,
                blank: false,
            }),
            type: new fields.StringField({
                required: true,
                nullable: false,
                blank: false,
                readonly: true,
                choices: NODE_NONBRIDGE_TYPES,
                validationError: "is not a valid Node Entry Type string",
            }),
            global: new fields.BooleanField({
                required: false,
                nullable: false,
                initial: false,
            }),
        }),
        {
            required: false,
            nullable: false,
        }
    ),
});

class TriggerData extends makeModuleDocument<ModuleDocument, TriggerDataSchema>(
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

    get isSubtriggerNode(): boolean {
        return this.event.type === "subtrigger";
    }

    getNode(id: NodeEntryId): TriggerNodeData | undefined {
        return this.nodes.get(id.split(".")[0]);
    }

    getVariable(id: NodeEntryId) {
        return this.variables[id];
    }

    addVariable(id: NodeEntryId, data: TriggerDataVariableSource) {
        this.update({ variables: { [id]: data } }, { broadcast: false });
    }

    removeVariable(id: NodeEntryId) {
        for (const node of this.nodes) {
            if (isVariable(node) && node.target === id) {
                node.delete({ broadcast: false });
            }
        }

        this.update({ variables: { [`-=${id}`]: null } }, { broadcast: false });
    }

    _initializeSource(
        data: object,
        options?: DataModelConstructionOptions<ModuleDocument> | undefined
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

        this.variables[`${this.event.id}.outputs.this`] = {
            type: "target",
            global: false,
            label: localize("entry.this"),
            locked: true,
        };

        // TODO add all the event variables
    }

    _onDeleteDescendantDocuments(
        parent: ModuleDocument,
        collection: string,
        nodes: TriggerNodeData[],
        nodeIds: string[],
        options: object
    ): void {
        const variables: Record<string, NodeEntryId[]> = {};

        for (const entryId of R.keys(this.variables)) {
            const nodeId = entryId.split(".")[0];
            (variables[nodeId] ??= []).push(entryId);
        }

        for (const nodeId of nodeIds) {
            const entryIds = variables[nodeId];

            for (const entryId of entryIds) {
                this.removeVariable(entryId);
            }
        }
    }
}

interface TriggerData {
    createEmbeddedDocuments(
        embeddedName: "Node",
        data: PreCreate<TriggerNodeDataSource>[],
        operation?: Partial<DatabaseCreateOperation<TriggerData>>
    ): Promise<TriggerNodeData[]>;
}

type TriggerDataSchema = {
    _id: IdField;
    name: fields.StringField<string, string, false, false, true>;
    enabled: fields.BooleanField<boolean, boolean, false, false, true>;
    nodes: fields.EmbeddedCollectionField<TriggerNodeData>;
    variables: fields.TypedObjectField<
        fields.SchemaField<TriggerVariableSchema>,
        Record<NodeEntryId, Omit<TriggerDataVariable, "locked">>,
        Record<NodeEntryId, TriggerDataVariable>,
        false
    >;
};

type TriggerDataSource = {
    name?: string;
    enabled?: boolean;
    nodes?: TriggerNodeDataSource[];
    variables?: Record<NodeEntryId, TriggerDataVariableSource>;
};

type TriggerVariableSchema = {
    label: fields.StringField<string, string, true>;
    type: fields.StringField<NonBridgeEntryType, NonBridgeEntryType, true, false, false>;
    global: fields.BooleanField<boolean, boolean, false>;
};

type TriggerDataVariable = ModelPropsFromSchema<TriggerVariableSchema> & {
    locked?: boolean;
};

type TriggerDataVariableSource = {
    label: string;
    type: NonBridgeEntryType;
    global?: boolean;
    locked?: boolean;
};

MODULE.devExpose({ TriggerData });

export { TriggerData };
export type { TriggerDataSource, TriggerDataVariable, TriggerDataVariableSource };
