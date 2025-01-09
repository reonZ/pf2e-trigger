const NODE_TYPES = ["event", "condition", "value", "action", "logic"] as const;
const NODE_ENTRY_TYPES = ["item", "boolean", "uuid", "text"] as const;
const NODE_ENTRY_CATEGORIES = ["inputs", "outputs"] as const;

abstract class TriggerNode {
    #data: NodeData;

    constructor(data: NodeData) {
        this.#data = data;
    }

    static get unique(): boolean {
        return false;
    }

    static get entriesSchema(): NodeSchema {
        return { outputs: [] };
    }

    get id(): string {
        return this.#data.id;
    }

    get type(): NodeType {
        return this.#data.type;
    }

    get key(): string {
        return this.#data.key;
    }

    get x(): number {
        return this.#data.x;
    }

    get y(): number {
        return this.#data.y;
    }

    get isUnique(): boolean {
        return !!(this.constructor as typeof TriggerNode).unique;
    }

    get schema(): NodeSchema {
        return (this.constructor as typeof TriggerNode).entriesSchema;
    }

    getValue(category: NodeEntryCategory, key: string): NodeEntryValue {
        return this.#readCursor(category, key).value;
    }

    getConnections(category: NodeEntryCategory, key: string): NodeEntryIdMap {
        return this.#readCursor(category, key).ids ?? {};
    }

    updateValue(category: NodeEntryCategory, key: string, value: NodeEntryValue) {
        this.#writeCursor(category, key).value = value;
    }

    addConnection(category: NodeEntryCategory, key: string, id: NodeEntryId) {
        const cursor = this.#writeCursor(category, key);
        cursor.ids ??= {};
        cursor.ids[id] = true;
    }

    #readCursor(category: NodeEntryCategory, key: string): NodeDataEntry {
        return this.#data[category][key] ?? {};
    }

    #writeCursor(category: NodeEntryCategory, key: string): NodeDataEntry {
        return (this.#data[category][key] ??= {});
    }
}

type NodeType = (typeof NODE_TYPES)[number];
type NodeEntryType = (typeof NODE_ENTRY_TYPES)[number];
type NodeEntryCategory = (typeof NODE_ENTRY_CATEGORIES)[number];

type NodeEntryValue = string | number | undefined;

type NodeEntryId = `${NodeType}.${string}.${NodeEntryCategory}.${string}`;
type NodeEntryIdMap = Record<NodeEntryId, boolean>;

type NodeEntryMap = Record<string, NodeDataEntry>;

type NodeDataEntry = {
    ids?: NodeEntryIdMap;
    value?: string | number;
};

type NodeDataRaw = DeepPartial<
    BaseNodeData & {
        inputs: NodeEntryMap;
        outputs: NodeEntryMap;
    }
>;

type BaseNodeData = {
    id: string;
    type: NodeType;
    key: string;
    x: number;
    y: number;
};

type NodeData = BaseNodeData & {
    inputs: NodeEntryMap;
    outputs: NodeEntryMap;
};

type NodeSchemaEntry = {
    key: string;
    label?: string;
    type?: NodeEntryType;
};

type NodeSchema = {
    inputs?: NodeSchemaEntry[];
    outputs: NodeSchemaEntry[];
};

export { NODE_ENTRY_CATEGORIES, NODE_TYPES, TriggerNode };
export type {
    NodeData,
    NodeDataEntry,
    NodeDataRaw,
    NodeEntryCategory,
    NodeEntryId,
    NodeEntryIdMap,
    NodeEntryMap,
    NodeEntryType,
    NodeEntryValue,
    NodeSchema,
    NodeSchemaEntry,
    NodeType,
};
