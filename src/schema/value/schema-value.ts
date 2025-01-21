import { NodeEntryType, NodeSchemaInputEntry, NodeSchemaOutputEntry } from "schema/schema";

function createValueSchema<T extends Exclude<NodeEntryType, "select" | undefined>>(
    type: T
): TypeValueSchema<T> {
    return {
        inputs: [{ key: "input", type, field: true }],
        outputs: [{ key: "value", type }],
    };
}

type TypeValueSchema<T extends Exclude<NodeEntryType, "select" | undefined>> = {
    inputs: [{ key: "input"; type: T; field: true }];
    outputs: [{ key: "value"; type: T }];
};

type ValueSchema = {
    inputs?: [NodeSchemaInputEntry];
    outputs: [WithRequired<NodeSchemaOutputEntry, "type">];
};

export type { TypeValueSchema, ValueSchema };
export { createValueSchema };
