import {
    NodeEntryCategory,
    NodeSchemaInputEntry,
    isEntryCategory,
    isInputConnection,
    isInputValue,
} from "@schema/schema";
import { R } from "module-helpers";

function processOutputEntryData(map: MaybePartial<NodeEntryMap>): NodeEntryMap {
    if (!R.isPlainObject(map)) return {};

    const processed: NodeEntryMap = {};

    for (const [key, entry] of R.entries(map)) {
        const ids = processEntryIds(entry?.ids);
        if (!ids.length) continue;
        processed[key] = { ids };
    }

    return processed;
}

function processInputEntryData(
    map: MaybePartial<NodeEntryMap>,
    nodeSchema: Maybe<NodeSchemaInputEntry[]>
): NodeEntryMap {
    if (!R.isPlainObject(map)) return {};

    const processed: NodeEntryMap = {};

    for (const [key, entry] of R.entries(map)) {
        if (key === "in") {
            const ids = processEntryIds(entry?.ids);
            if (ids.length) {
                processed[key] = { ids };
            }
            continue;
        }

        const schema = nodeSchema?.find((x) => x.key === key);
        if (!schema) continue;

        if (isInputConnection(schema)) {
            const ids = processEntryIds(entry?.ids);
            if (!ids.length) continue;
            processed[key] = { ids };
        } else if (isInputValue(schema, entry?.value)) {
            processed[key] = { value: entry.value };
        }
    }

    return processed;
}

function processEntryIds(ids: unknown): NodeEntryId[] {
    return R.isArray(ids) ? R.filter(ids, (id): id is NodeEntryId => isEntryId(id)) : [];
}

function isEntryId(id: unknown): id is NodeEntryId {
    if (!R.isString(id)) return false;

    const seg = id.split(".");
    return seg.length === 3 && isEntryCategory(seg[1]);
}

function segmentEntryId(id: NodeEntryId): SegmentedEntryId {
    const [nodeId, category, key] = id.split(".");
    return { nodeId, category, key } as SegmentedEntryId;
}

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

export { processInputEntryData, processOutputEntryData, segmentEntryId };
export type { NodeDataEntry, NodeEntryId, NodeEntryMap, SegmentedEntryId };
