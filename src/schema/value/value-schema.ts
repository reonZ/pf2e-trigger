import {
    NodeSchemaInputEntry,
    NodeSchemaOutputEntry,
    NonNullableNodeEntryType,
} from "@schema/schema";

function createValueSchema(type: Exclude<NonNullableNodeEntryType, "select">): ValueSchema {
    return {
        inputs: [{ key: "in", type, field: true }],
        outputs: [{ key: "value", type }],
    };
}

type ValueSchema = {
    inputs?: NodeSchemaInputEntry[];
    outputs: WithRequired<NodeSchemaOutputEntry, "type">[];
};

export type { ValueSchema };
export { createValueSchema };
