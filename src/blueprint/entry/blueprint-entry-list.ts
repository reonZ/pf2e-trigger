import { BlueprintNode } from "blueprint/node/blueprint-node";
import { isNonNullNodeEntryType } from "data/data-entry";
import { BlueprintEntry } from "./blueprint-entry";
import { BlueprintBridgeEntry } from "./blueprint-entry-bridge";
import { BlueprintBooleanEntry } from "./blueprint-entry-input/blueprint-entry-boolean";
import { BlueprintNumberEntry } from "./blueprint-entry-input/blueprint-entry-number";
import { BlueprintSelectEntry } from "./blueprint-entry-input/blueprint-entry-select";
import { BlueprintTextEntry } from "./blueprint-entry-input/blueprint-entry-text";
import { BlueprintUuidEntry } from "./blueprint-entry-input/blueprint-entry-uuid";
import { BlueprintValueEntry } from "./blueprint-entry-value";
import { BlueprintConverterEntry } from "./blueprint-entry-converter";
import { BlueprintLabelEntry } from "./blueprint-entry-label";

const INPUTS_ENTRIES = {
    number: BlueprintNumberEntry,
    boolean: BlueprintBooleanEntry,
    select: BlueprintSelectEntry,
    text: BlueprintTextEntry,
    uuid: BlueprintUuidEntry,
} as const satisfies Record<NonNullNodeEntryType, typeof BlueprintEntry<"inputs">>;

function createBlueprintEntry(
    category: NodeEntryCategory,
    node: BlueprintNode,
    schema: NodeSchemaEntry
): BlueprintEntry {
    const entry =
        "type" in schema && schema.type
            ? node.type === "converter"
                ? new BlueprintConverterEntry(category, node, schema)
                : schema.type === "label"
                ? new BlueprintLabelEntry(category, node, schema)
                : category === "inputs" &&
                  isNonNullNodeEntryType(schema.type) &&
                  node.type !== "splitter" &&
                  (["value", "event"].includes(node.type) || !!(schema as NodeSchemaInput).field)
                ? new INPUTS_ENTRIES[schema.type](category, node, schema as NodeSchemaInput)
                : new BlueprintValueEntry(category, node, schema)
            : new BlueprintBridgeEntry(category, node, schema);

    entry.initialize();

    return entry;
}

export { createBlueprintEntry };
