import { createActionSchema } from "./schema-action";

const addItemSchema = createActionSchema(
    [
        { key: "item", type: "item" },
        { key: "duplicate", type: "boolean", field: { default: true } },
    ] as const,
    [{ key: "item", type: "item" }] as const
);

export { addItemSchema };
