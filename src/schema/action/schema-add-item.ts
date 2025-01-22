import { ActionSchema } from "./schema-action";

const addItemSchema = {
    in: true,
    inputs: [
        { key: "item", type: "item" },
        { key: "duplicate", type: "boolean", field: { default: true } },
    ],
    outputs: [{ key: "out" }],
} as const satisfies ActionSchema;

export { addItemSchema };
