import { R } from "module-helpers";

const NODE_ENTRY_TYPES = ["item", "boolean", "uuid", "text"] as const;
const NODE_ENTRY_CATEGORIES = ["inputs", "outputs"] as const;

function processEntryDataMap(map: MaybePartial<NodeEntryMap>): NodeEntryMap {
    if (!R.isPlainObject(map)) return {};

    return R.pipe(
        R.entries(map),
        R.filter((x): x is [string, NodeDataEntry] => isNodeEntry(x[1])),
        R.map(([key, entry]) => [key, processEntryData(entry)] as const),
        R.mapToObj(([key, entry]) => [key, entry])
    );
}

function processEntryData(entry: MaybePartial<NodeDataEntry>): NodeDataEntry {
    return !R.isPlainObject(entry)
        ? {}
        : R.isPlainObject(entry.ids)
        ? { ids: processEntryIds(entry.ids) }
        : !R.isNullish(entry.value)
        ? { value: entry.value }
        : {};
}

function processEntryIds(ids: NodeEntryIdMap): NodeEntryIdMap {
    return R.pipe(
        R.entries(ids),
        R.filter((entry) => isEntryId(entry[0]) && R.isBoolean(entry[1]) && entry[1]),
        R.mapToObj(R.identity())
    );
}

function isEntryId(id: Maybe<NodeEntryId | string>): id is NodeEntryId {
    if (!R.isString(id)) return false;

    const seg = id.split(".");
    return seg.length === 3 && isEntryCategory(seg[1]);
}

function isEntryCategory(
    category: Maybe<NodeEntryCategory | string>
): category is NodeEntryCategory {
    return R.isString(category) && NODE_ENTRY_CATEGORIES.includes(category as NodeEntryCategory);
}

function isNodeEntry(data: MaybePartial<NodeDataEntry>): data is NodeDataEntry {
    if (!R.isPlainObject(data)) return false;
    return (
        (R.isNullish(data.ids) && (R.isString(data.value) || R.isNumber(data.value))) ||
        (R.isNullish(data.value) && R.isPlainObject(data.ids))
    );
}

function segmentEntryId(id: NodeEntryId): SegmentedEntryId {
    const [nodeId, category, key] = id.split(".");
    return { nodeId, category, key } as SegmentedEntryId;
}

type NodeEntryType = (typeof NODE_ENTRY_TYPES)[number];
type NodeEntryCategory = (typeof NODE_ENTRY_CATEGORIES)[number];

type NodeEntryMap = Record<string, NodeDataEntry>;

type NodeDataEntry = {
    ids?: NodeEntryIdMap;
    value?: string | number;
};

type NodeEntryId = `${string}.${NodeEntryCategory}.${string}`;
type NodeEntryIdMap = Partial<Record<NodeEntryId, boolean>>;

type SegmentedEntryId = {
    nodeId: string;
    category: NodeEntryCategory;
    key: string;
};

export { isNodeEntry, processEntryDataMap, segmentEntryId };
export type {
    NodeDataEntry,
    NodeEntryCategory,
    NodeEntryId,
    NodeEntryIdMap,
    NodeEntryMap,
    NodeEntryType,
    SegmentedEntryId,
};
