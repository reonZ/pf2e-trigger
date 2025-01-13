import { R } from "module-helpers";

const NODE_ENTRY_TYPES = ["item", "boolean", "uuid", "text"] as const;
const NODE_ENTRY_CATEGORIES = ["inputs", "outputs"] as const;

function processEntryDataMap(map: MaybePartial<NodeEntryMap>): NodeEntryMap {
    if (!R.isPlainObject(map)) return {};

    return R.pipe(
        R.entries(map),
        R.map(([key, entry]) => [key, processEntryData(entry)] as const),
        R.mapToObj(([key, entry]) => [key, entry])
    );
}

function processEntryData(entry: MaybePartial<NodeDataEntry>): NodeDataEntry {
    return !R.isPlainObject(entry)
        ? {}
        : R.isArray(entry.ids)
        ? { ids: processEntryIds(entry.ids) }
        : !R.isNullish(entry.value)
        ? { value: entry.value }
        : {};
}

function processEntryIds(ids: Array<unknown>): NodeEntryId[] {
    return R.filter(ids, (id): id is NodeEntryId => isEntryId(id));
}

function isEntryId(id: unknown): id is NodeEntryId {
    if (!R.isString(id)) return false;

    const seg = id.split(".");
    return seg.length === 3 && isEntryCategory(seg[1]);
}

function isEntryCategory(
    category: Maybe<NodeEntryCategory | string>
): category is NodeEntryCategory {
    return R.isString(category) && NODE_ENTRY_CATEGORIES.includes(category as NodeEntryCategory);
}

function segmentEntryId(id: NodeEntryId): SegmentedEntryId {
    const [nodeId, category, key] = id.split(".");
    return { nodeId, category, key } as SegmentedEntryId;
}

type NodeEntryType = (typeof NODE_ENTRY_TYPES)[number];
type NodeEntryCategory = (typeof NODE_ENTRY_CATEGORIES)[number];

type NodeEntryMap = Record<string, NodeDataEntry>;

type NodeDataEntry = {
    ids?: NodeEntryId[];
    value?: string | number;
};

type NodeEntryId = `${string}.${NodeEntryCategory}.${string}`;

type SegmentedEntryId = {
    nodeId: string;
    category: NodeEntryCategory;
    key: string;
};

export { processEntryDataMap, segmentEntryId };
export type {
    NodeDataEntry,
    NodeEntryCategory,
    NodeEntryId,
    NodeEntryMap,
    NodeEntryType,
    SegmentedEntryId,
};
