import { booleanSchemaOuts } from "schema/schema";

const matchPredicateSchema = {
    in: true,
    outs: booleanSchemaOuts,
    inputs: [
        { key: "list", type: "list" },
        { key: "predicate", type: "text", field: true },
    ],
} as const satisfies NodeRawSchema;

export { matchPredicateSchema };
