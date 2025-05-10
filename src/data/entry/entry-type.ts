import { BlueprintEntry } from "blueprint";
import { R } from "module-helpers";
import { NodeEntryCategory } from "./_utils";

const NODE_ENTRY_TYPES = [
    "boolean",
    "dc",
    "duration",
    "effect",
    "item",
    "list",
    "number",
    "select",
    "target",
    "text",
    "bridge",
    "roll",
    "uuid",
] as const;

const DOCUMENT_TYPES = ["Item", "Macro"] as const;

const NODE_NONBRIDGE_TYPES = NODE_ENTRY_TYPES.filter((type) => type !== "bridge");

const NODE_CUSTOM_TYPES = R.difference(NODE_NONBRIDGE_TYPES, [
    "select",
    "uuid",
]) as NodeCustomEntryType[];

// output -> input
const OUTPUT_COMPATIBLES: PartialRecord<NodeEntryType, NodeEntryType[]> = {
    dc: ["number"],
    item: ["uuid"],
    list: ["text"],
    number: ["dc"],
    select: ["text", "list"],
    text: ["select", "list"],
    uuid: ["item"],
};

// input -> output
const INPUT_COMPATIBLES = R.pipe(
    OUTPUT_COMPATIBLES,
    R.entries(),
    R.flatMap(([output, inputs]) => {
        return inputs.map((input) => ({ input, output }));
    }),
    R.groupBy(R.prop("input")),
    R.mapValues((outputs) => outputs.map(R.prop("output")))
);

const COMPATIBLES: Record<NodeEntryCategory, PartialRecord<NodeEntryType, NodeEntryType[]>> = {
    inputs: INPUT_COMPATIBLES,
    outputs: OUTPUT_COMPATIBLES,
};

function getCompatibleTypes(type: NodeEntryType, category: NodeEntryCategory): NodeEntryType[] {
    return (COMPATIBLES[category][type] ?? []).concat(type);
}

function entriesAreCompatible(origin: BlueprintEntry, target: BlueprintEntry): boolean {
    if (origin.category === target.category) {
        return false;
    }

    return (
        origin.type === target.type ||
        !!COMPATIBLES[origin.category][origin.type]?.includes(target.type)
    );
}

type NodeEntryType = (typeof NODE_ENTRY_TYPES)[number];
type NonBridgeEntryType = (typeof NODE_NONBRIDGE_TYPES)[number];
type NodeCustomEntryType = Exclude<NonBridgeEntryType, "select" | "uuid">;

export {
    entriesAreCompatible,
    getCompatibleTypes,
    DOCUMENT_TYPES,
    NODE_CUSTOM_TYPES,
    NODE_ENTRY_TYPES,
    NODE_NONBRIDGE_TYPES,
};
export type { NodeCustomEntryType, NodeEntryType, NonBridgeEntryType };
