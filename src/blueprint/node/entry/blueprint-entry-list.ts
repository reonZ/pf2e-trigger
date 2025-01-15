import { NodeEntryCategory, NodeSchemaInputEntry, NodeSchemaOutputEntry } from "@schema/schema";
import { BlueprintNodeBody } from "../blueprint-node-body";
import { BlueprintEntry } from "./blueprint-entry";
import { BlueprintBridgeEntry } from "./blueprint-entry-bridge";
import { BlueprintBooleanEntry } from "./value/blueprint-entry-boolean";
import { BlueprintItemEntry } from "./value/blueprint-entry-item";
import { BlueprintNumberEntry } from "./value/blueprint-entry-number";
import { BlueprintSelectEntry } from "./value/blueprint-entry-select";
import { BlueprintTextEntry } from "./value/blueprint-entry-text";
import { BlueprintUuidEntry } from "./value/blueprint-entry-uuid";

const INPUTS_ENTRIES = {
    boolean: BlueprintBooleanEntry,
    item: BlueprintItemEntry,
    number: BlueprintNumberEntry,
    select: BlueprintSelectEntry,
    text: BlueprintTextEntry,
    uuid: BlueprintUuidEntry,
};

function createBlueprintEntry(
    category: NodeEntryCategory,
    body: BlueprintNodeBody,
    schema: NodeSchemaInputEntry | NodeSchemaOutputEntry
): BlueprintEntry {
    const entry = schema.type
        ? new INPUTS_ENTRIES[schema.type](category, body, schema)
        : new BlueprintBridgeEntry(category, body, schema);

    entry.initialize();

    return entry;
}

export { createBlueprintEntry };
