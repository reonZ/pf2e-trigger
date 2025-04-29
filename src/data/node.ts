import {
    NodeCustomEntryType,
    NodeDataEntry,
    NodeDataEntrySource,
    NodeEntryCategory,
    NodeEntryField,
    NodeEntryId,
    NodeEntryIdField,
    NodeEntryValue,
    segmentEntryId,
    TriggerData,
} from "data";
import {
    DataUnionField,
    IdField,
    localize,
    makeModuleDocument,
    MODULE,
    ModuleDocument,
    PositionField,
    R,
    RecordField,
    roundToStep,
    SchemaField,
} from "module-helpers";
import {
    BaseNodeSchemaEntry,
    getSchema,
    isSubtriggerNode,
    isValidNodeKey,
    isVariable,
    NODE_KEYS,
    NodeCustomEntryCategory,
    NodeInputSchema,
    NodeKey,
    nodeSchemaEntries,
    NodeSchemaEntriesSchema,
    NodeSchemaEntriesSource,
    NodeSchemaEntry,
    NodeSchemaModel,
} from "schema";
import fields = foundry.data.fields;
import abstract = foundry.abstract;

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
    type: new fields.StringField({
        required: true,
        nullable: false,
        blank: false,
        readonly: true,
        choices: NODE_TYPES,
        validationError: "is not a valid Node Type string",
    }),
    key: new fields.StringField<NodeKey, NodeKey, true, false, true>({
        required: true,
        nullable: false,
        blank: false,
        readonly: true,
        choices: NODE_KEYS,
    }),
    target: new DataUnionField(
        [
            new NodeEntryIdField<"outputs">({ category: "outputs" }),
            new fields.DocumentIdField<string, false, false, false>({
                required: false,
                nullable: false,
                blank: false,
                readonly: true,
            }),
        ],
        {
            required: false,
            nullable: false,
            readonly: true,
        }
    ),
    position: new PositionField(),
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

class TriggerNodeData extends makeModuleDocument<ModuleDocument, TriggerNodeDataSchema>(
    triggerNodeDataMetadata,
    triggerNodeDataSchema
) {
    declare nodeSchema: NodeSchemaModel;
    declare schemaInputs: Record<string, ModelPropsFromSchema<NodeInputSchema>>;

    static validateJoint(data: SourceFromSchema<TriggerNodeDataSchema>): void {
        if (!isValidNodeKey(data.type, data.key)) {
            throw MODULE.Error(`'${data.key}' isn't a valid '${data.type}' key`);
        }

        if (data.target) {
            const split = data.target.split(".");

            if (isVariable(data) && split.length !== 3) {
                throw MODULE.Error("variable node must have a target NodeEntryId");
            }

            if (isSubtriggerNode(data) && split.length !== 1) {
                throw MODULE.Error("subtrigger node must have a target subtrigger id");
            }
        }
    }

    get isEvent(): boolean {
        return isEventNode(this);
    }

    *entries(): Generator<[NodeEntryCategory, key: string, NodeDataEntry], void, undefined> {
        for (const [key, input] of R.entries(this.inputs)) {
            yield ["inputs", key, input];
        }

        for (const [key, output] of R.entries(this.outputs)) {
            yield ["outputs", key, output];
        }
    }

    getEntry(id: NodeEntryId): NodeDataEntry | undefined {
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

    setValue(id: NodeEntryId, value: NodeEntryValue) {
        const { category, key } = segmentEntryId(id);
        const update = R.isNullish(value) ? { ["-=value"]: null } : { value };

        this.update({
            [category]: {
                [key]: update,
            },
        });
    }

    getConnections(id: NodeEntryId): NodeEntryId[] {
        return this.getEntry(id)?.ids ?? [];
    }

    disconnect(entryId: NodeEntryId, skipSelf?: boolean) {
        const { category, key } = segmentEntryId(entryId);
        const entry = this[category][key];
        const parent = this.parent;
        if (!entry || !parent) return;

        const oppositeCategory = category === "inputs" ? "outputs" : "inputs";
        const connections = entry.ids ?? [];

        for (const otherEntryId of connections) {
            const otherNode = parent.getNode(otherEntryId);
            const { key: otherKey } = segmentEntryId(otherEntryId);
            const otherEntry = otherNode?.[oppositeCategory][otherKey];
            if (!otherNode || !otherEntry) continue;

            const otherConnections = otherEntry.ids?.slice() ?? [];
            const removed = otherConnections.findSplice((id) => id === entryId);

            if (removed) {
                otherNode.update(
                    { [oppositeCategory]: { [otherKey]: { ids: otherConnections } } },
                    { broadcast: false }
                );
            }
        }

        if (!skipSelf) {
            this.update({ [category]: { [key]: { ids: [] } } }, { broadcast: false });
        }
    }

    addConnection(entryId: NodeEntryId, addId: NodeEntryId) {
        const { category, key } = segmentEntryId(entryId);
        const connections = this[category][key]?.ids ?? [];

        connections.push(addId);

        this.update(
            { [category]: { [key]: { ids: R.unique(connections) } } },
            { broadcast: false }
        );
    }

    addCustomEntry({
        category,
        label,
        type,
        group,
    }: {
        category: NodeCustomEntryCategory;
        type: NodeCustomEntryType;
        label?: string;
        group?: string;
    }) {
        const entries = (this._source.custom?.[category]?.slice() ?? []) as NodeSchemaEntry[];
        const key = foundry.utils.randomID();

        entries.push({
            key,
            type,
            label: label?.trim() || localize("entry", type),
            group: group ?? "",
            custom: true,
        });

        this.update({
            custom: {
                [category]: entries,
            },
        });
    }

    removeCustomEntry(
        category: NodeCustomEntryCategory,
        { type, key, group = "" }: BaseNodeSchemaEntry
    ) {
        const entries = this._source.custom?.[category]?.slice() ?? [];
        const removed = entries.findSplice(
            (entry) => entry.type === type && entry.key === key && (entry.group ?? "") === group
        );

        if (!removed) return;

        if (category !== "outs") {
            const id: NodeEntryId = `${this.id}.${category}.${removed.key}`;
            this.parent?.removeVariable(id);
        }

        this.update({
            custom: {
                [category]: entries,
            },
        });
    }

    _initializeSource(
        data: object,
        options?: DataModelConstructionOptions<ModuleDocument> | undefined
    ): this["_source"] {
        const source = super._initializeSource(data, options);

        if (isEventNode(source)) {
            source.position = { x: 350, y: 200 };
        }

        return source;
    }

    _initialize(options?: Record<string, unknown>): void {
        super._initialize(options);

        const schema = (this.nodeSchema = getSchema(this)!);
        this.schemaInputs = R.mapToObj(schema.inputs, (input) => [input.key, input]);
    }

    _onDelete() {
        for (const [category, key] of this.entries()) {
            const entryId = `${this._id}.${category}.${key}` satisfies NodeEntryId;
            this.disconnect(entryId, true);
        }
    }
}

function isEventNode(node: { type: NodeType; key: NodeKey }): boolean {
    return node.type === "event" || (node.type === "subtrigger" && node.key === "subtrigger-input");
}

interface TriggerNodeData {
    parent: TriggerData;

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

    update(
        data: DeepPartial<TriggerNodeDataSource>,
        operation?: Partial<DatabaseUpdateOperation<ModuleDocument>>
    ): Promise<this | undefined>;
}

type NodeType = (typeof NODE_TYPES)[number];

type TriggerNodeDataSchema = {
    _id: IdField;
    type: fields.StringField<NodeType, NodeType, true, false, false>;
    key: fields.StringField<NodeKey, NodeKey, true, false, true>;
    target: DataUnionField<
        NodeEntryIdField<"outputs"> | fields.DocumentIdField<string, false, false, false>,
        string | NodeEntryId,
        false,
        false,
        false
    >;
    position: PositionField;
    inputs: RecordField<NodeEntryField, false>;
    outputs: RecordField<NodeEntryField, false>;
    custom: SchemaField<NodeSchemaEntriesSchema, false, false, false>;
};

type TriggerNodeDataSource = {
    type: NodeType;
    key: NodeKey;
    target?: string | NodeEntryId;
    position?: Partial<Point>;
    inputs?: Record<string, NodeDataEntrySource>;
    outputs?: Record<string, NodeDataEntrySource>;
    custom?: NodeSchemaEntriesSource;
};

MODULE.devExpose({ TriggerNodeData });

export { isEventNode, NODE_TYPES, TriggerNodeData };
export type { NodeType, TriggerNodeDataSource };
