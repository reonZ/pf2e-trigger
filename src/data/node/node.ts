import {
    NodeEntryField,
    NodeEntryId,
    NodeEntryValue,
    NodeType,
    segmentEntryId,
    TriggerEntryData,
    TriggerNodeTypeField,
} from "data";
import {
    IdField,
    makeModuleDocument,
    MODULE,
    PositionField,
    R,
    RecordField,
    roundToStep,
    SchemaField,
} from "module-helpers";
import {
    getSchema,
    isValidNodeKey,
    NODE_KEYS,
    NodeInputSchema,
    NodeKey,
    nodeSchemaEntries,
    NodeSchemaEntries,
    NodeSchemaModel,
    NonBridgeEntrySchema,
} from "schema";
import fields = foundry.data.fields;
import abstract = foundry.abstract;

const triggerNodeDataMetadata = (): Partial<abstract.DocumentClassMetadata> => ({
    name: "Node",
    collection: "nodes",
    indexed: true,
    hasTypeData: true,
    label: "Node",
    schemaVersion: "2.0.0",
});

const triggerNodeDataSchema = (): TriggerNodeDataSchema => ({
    _id: new IdField(),
    type: new TriggerNodeTypeField(),
    key: new fields.StringField<NodeKey, NodeKey, true, false, true>({
        required: true,
        nullable: false,
        blank: false,
        readonly: true,
        choices: NODE_KEYS,
    }),
    position: new PositionField(),
    subId: new fields.DocumentIdField<string, false, false, false>({
        required: false,
        nullable: false,
        blank: false,
        initial: undefined,
        readonly: true,
    }),
    inputs: new fields.TypedObjectField(new NodeEntryField("outputs"), {
        required: false,
    }),
    outputs: new fields.TypedObjectField(new NodeEntryField("inputs"), {
        required: false,
    }),
    custom: new fields.SchemaField(nodeSchemaEntries(), {
        required: false,
        nullable: false,
    }),
});

class TriggerNodeData extends makeModuleDocument<abstract._Document, TriggerNodeDataSchema>(
    triggerNodeDataMetadata,
    triggerNodeDataSchema
) {
    declare nodeSchema: NodeSchemaModel;
    declare schemaInputs: Record<string, ModelPropsFromSchema<NodeInputSchema>>;
    declare schemaOutputs: Record<string, ModelPropsFromSchema<NonBridgeEntrySchema>>;

    static validateJoint(data: SourceFromSchema<TriggerNodeDataSchema>): void {
        if (!isValidNodeKey(data.type, data.key)) {
            throw MODULE.Error(`'${data.key}' isn't a valid '${data.type}' key`);
        }
    }

    get isEvent(): boolean {
        return isEventNode(this);
    }

    getEntry(id: NodeEntryId): TriggerEntryData | undefined {
        const { category, key } = segmentEntryId(id);
        return this[category][key];
    }

    getValue(id: NodeEntryId): NodeEntryValue {
        const { category, key } = segmentEntryId(id);
        const entry = this[category][key];
        const schema = this.schemaInputs[key];
        if (!schema) return;

        const value = entry?.value;
        const defaultValue = schema.field?.default;

        switch (schema.type) {
            case "number": {
                if (!R.isNumber(value)) {
                    return defaultValue ?? 0;
                }

                return Math.clamp(
                    roundToStep(value, schema.field?.step ?? 1),
                    schema.field?.min ?? -Infinity,
                    schema.field?.max ?? Infinity
                );
            }

            case "boolean": {
                return R.isBoolean(value) ? value : defaultValue ?? false;
            }

            case "text": {
                return R.isString(value) ? value : defaultValue ?? "";
            }

            case "select": {
                const options = schema.field?.options ?? [];
                return R.isString(value) && options.find((option) => option.value === value)
                    ? value
                    : defaultValue ?? options[0].value;
            }

            default: {
                return value ?? defaultValue;
            }
        }
    }

    getConnections(id: NodeEntryId): NodeEntryId[] {
        return this.getEntry(id)?.ids ?? [];
    }

    _initializeSource(
        data: object,
        options?: DataModelConstructionOptions<foundry.abstract._Document> | undefined
    ): this["_source"] {
        const source = super._initializeSource(data, options);

        if (isEventNode(source)) {
            source.position = { x: 350, y: 200 };
        }

        return source;
    }

    _initialize(options?: Record<string, unknown>): void {
        super._initialize(options);

        const schema = (this.nodeSchema = getSchema(this.type, this.key)!);
        this.schemaInputs = R.mapToObj(schema.inputs, (input) => [input.key, input]);
        this.schemaOutputs = R.mapToObj(schema.outputs, (output) => [output.key, output]);
    }
}

function isEventNode(node: { type: NodeType; key: NodeKey }): boolean {
    return node.type === "event" || (node.type === "subtrigger" && node.key === "subtrigger-input");
}

interface TriggerNodeData {
    clone(
        data: DeepPartial<TriggerNodeDataSource>,
        context: DocumentCloneContext & { save: true }
    ): Promise<this>;
    clone(
        data?: DeepPartial<TriggerNodeDataSource>,
        context?: DocumentCloneContext & { save?: false }
    ): this;
    clone(
        data?: DeepPartial<TriggerNodeDataSource>,
        context?: DocumentCloneContext
    ): this | Promise<this>;
}

type TriggerNodeDataSchema = {
    _id: IdField;
    type: TriggerNodeTypeField;
    key: fields.StringField<NodeKey, NodeKey, true, false, true>;
    position: PositionField;
    subId: fields.DocumentIdField<string, false, false, false>;
    inputs: RecordField<NodeEntryField, false>;
    outputs: RecordField<NodeEntryField, false>;
    custom: SchemaField<NodeSchemaEntries, false, false, false>;
};

type TriggerNodeDataSource = SourceFromSchema<TriggerNodeDataSchema>;

type PartialTriggerNodeDataSource = WithRequired<
    DeepPartial<TriggerNodeDataSource>,
    "type" | "key"
>;

MODULE.devExpose({ TriggerNodeData });

export { isEventNode, TriggerNodeData };
export type { PartialTriggerNodeDataSource, TriggerNodeDataSource };
