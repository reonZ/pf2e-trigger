import { ValueSchema } from "./schema-value";

const rollDataSchema = {
    inputs: [
        { key: "origin", type: "target" },
        { key: "item", type: "item" },
        { key: "options", type: "text", field: true },
        { key: "traits", type: "text", field: true },
    ],
    outputs: [{ key: "roll", type: "roll" }],
} as const satisfies ValueSchema;

export { rollDataSchema };
