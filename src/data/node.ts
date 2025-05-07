import {
    createEntryId,
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
    localizeIfExist,
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
    isEvent,
    isSubtriggerEvent,
    isSubtriggerNode,
    isSubtriggerOutput,
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
    declare schemaInputs: Collection<ModelPropsFromSchema<NodeInputSchema>>;

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
        return isEvent(this);
    }

    get isSutriggerEvent(): boolean {
        return isSubtriggerEvent(this);
    }

    get isSubtriggerOutput(): boolean {
        return isSubtriggerOutput(this);
    }

    get isSubtriggerNode(): boolean {
        return isSubtriggerNode(this);
    }

    get triggers(): abstract.EmbeddedCollection<TriggerData> | undefined {
        return this.parent?.triggers;
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

    getValue(key: string): NodeEntryValue {
        const entry = this.inputs[key];
        const schema = this.schemaInputs.get(key);
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
                otherNode.update({ [oppositeCategory]: { [otherKey]: { ids: otherConnections } } });
            }
        }

        if (!skipSelf) {
            this.update({ [category]: { [key]: { ids: [] } } });
        }
    }

    addConnection(entryId: NodeEntryId, addId: NodeEntryId) {
        const { category, key } = segmentEntryId(entryId);
        const connections = this[category][key]?.ids ?? [];

        connections.push(addId);

        this.update({
            [category]: {
                [key]: {
                    ids: R.unique(connections),
                    ["-=value"]: null,
                },
            },
        });
    }

    addCustomEntry({
        category,
        label,
        type,
        group,
        key,
    }: {
        category: NodeCustomEntryCategory;
        type: NodeCustomEntryType;
        label?: string;
        group?: string;
        key?: string;
    }) {
        key = key?.trim() || foundry.utils.randomID();

        const entries = (this._source.custom?.[category]?.slice() ?? []) as NodeSchemaEntry[];
        const entry: NodeSchemaEntry = {
            key,
            type,
            label: label?.trim() || localizeIfExist("entry", type) || key,
            group: group ?? "",
            custom: true,
        };

        entries.push(entry);

        this.update({
            custom: {
                [category]: entries,
            },
        });

        if (this.isSutriggerEvent) {
            // we re-initialize the trigger to update the variables
            this.parent.reset();
        }

        if (this.isSutriggerEvent || this.isSubtriggerOutput) {
            // we re-initialize all the subtrigger-node out there
            for (const trigger of this.triggers ?? []) {
                if (trigger.isSubtrigger) continue;

                for (const node of trigger.nodes) {
                    if (node.isSubtriggerNode && node.target === this.parent._id) {
                        node.reset();
                    }
                }
            }
        }
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

        if (category === "outputs") {
            // we remove the variable for this entry if it exist
            const variableId = createEntryId(this, "outputs", key);
            this.parent?.removeVariable(variableId);
        }

        // we disconnect the entry before removing it
        const entryId = createEntryId(this, category, key);
        this.disconnect(entryId, true);

        this.update({
            custom: {
                [category]: entries,
            },
        });

        if (this.isSutriggerEvent || this.isSubtriggerOutput) {
            const oppositeCategory = category === "inputs" ? "outputs" : "inputs";

            // we go overe all the subtrigger-node out there
            for (const trigger of this.triggers ?? []) {
                if (trigger.isSubtrigger) continue;

                for (const node of trigger.nodes) {
                    if (!node.isSubtriggerNode || node.target !== this.parent._id) continue;

                    if (this.isSubtriggerOutput) {
                        // we remove the variable if it exist
                        const variableId = createEntryId(node, "outputs", key);
                        trigger.removeVariable(variableId);
                    }

                    // we disconnect the removed entry first
                    const entryId = createEntryId(node, oppositeCategory, key);
                    node.disconnect(entryId, true);

                    // we re-initialize
                    node.reset();
                }
            }
        }
    }

    _initializeSource(
        data: object,
        options?: DataModelConstructionOptions<ModuleDocument> | undefined
    ): this["_source"] {
        const source = super._initializeSource(data, options);

        if (isEvent(source)) {
            source.position = { x: 350, y: 200 };
        }

        return source;
    }

    _initialize(options?: Record<string, unknown>) {
        super._initialize(options);
        this._initializeSchema();
    }

    _initializeSchema() {
        this.nodeSchema = getSchema(this)!;

        this.schemaInputs = new Collection(
            R.pipe(
                this.nodeSchema.inputs,
                R.map((input) => [input.key, input] as const)
            )
        );
    }

    _onDelete() {
        for (const [category, key] of this.entries()) {
            const entryId = createEntryId(this, category, key);
            this.disconnect(entryId, true);
        }
    }
}

interface TriggerNodeData {
    parent: TriggerData;

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

export { NODE_TYPES, TriggerNodeData };
export type { NodeType, TriggerNodeDataSource };
