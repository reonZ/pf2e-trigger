import { createAction } from "./schema-action";

const addItemSchema = createAction(
    [
        { key: "item", type: "item" },
        { key: "duplicate", type: "boolean", field: { default: true } },
    ] as const,
    [{ key: "item", type: "item" }] as const
);

export { addItemSchema };
