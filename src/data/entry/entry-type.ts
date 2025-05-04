import { R } from "module-helpers";

const NODE_ENTRY_TYPES = [
    "boolean",
    "dc",
    "duration",
    "item",
    "list",
    "number",
    "select",
    "target",
    "text",
    "bridge",
    "roll",
] as const;

const NODE_NONBRIDGE_TYPES = NODE_ENTRY_TYPES.filter((type) => type !== "bridge");

const NODE_CUSTOM_TYPES = NODE_NONBRIDGE_TYPES.filter((type) => type !== "select");

const COMPATIBLE_ENTRY_GROUPS: NodeEntryType[][] = [
    ["dc", "number"],
    ["text", "select"],
];

const COMPATIBLE_ENTRIES = R.pipe(
    COMPATIBLE_ENTRY_GROUPS,
    R.flatMap((group) => {
        return R.pipe(
            group,
            R.map((entry): [NodeEntryType, NodeEntryType[]] => {
                return [entry, group.filter((y) => y !== entry)];
            })
        );
    }),
    R.fromEntries()
);

function getNodeEntryTypes(): NodeEntryType[] {
    return NODE_ENTRY_TYPES as unknown as NodeEntryType[];
}

function entriesAreCompatible(origin: NodeEntryType, target: NodeEntryType): boolean {
    return origin === target || !!COMPATIBLE_ENTRIES[origin]?.includes(target);
}

function getCompatibleTypes(type: NodeEntryType): NodeEntryType[] {
    return [type, ...(COMPATIBLE_ENTRIES[type] ?? [])];
}

type NodeEntryType = (typeof NODE_ENTRY_TYPES)[number];
type NonBridgeEntryType = (typeof NODE_NONBRIDGE_TYPES)[number];
type NodeCustomEntryType = (typeof NODE_CUSTOM_TYPES)[number];

export {
    entriesAreCompatible,
    getCompatibleTypes,
    getNodeEntryTypes,
    NODE_CUSTOM_TYPES,
    NODE_ENTRY_TYPES,
    NODE_NONBRIDGE_TYPES,
};
export type { NodeCustomEntryType, NodeEntryType, NonBridgeEntryType };
