import { booleanSchemaOuts } from "schema/schema";

const containsValueSchema = {
    in: true,
    unique: true,
    outs: booleanSchemaOuts,
    inputs: [
        { key: "list", type: "list" },
        { key: "value", type: "text", field: true },
    ],
} as const satisfies NodeRawSchema;

export { containsValueSchema };
