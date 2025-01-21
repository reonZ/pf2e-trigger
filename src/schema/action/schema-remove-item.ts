import { ActionSchema } from "./schema-action";

const removeItemSchema = {
    in: true,
    inputs: [{ key: "item", type: "item" }],
    outputs: [{ key: "out" }],
} as const satisfies ActionSchema;

export { removeItemSchema };
