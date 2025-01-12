import { NodeSchema } from "@schema/schema";

const hasItemSchema = {
    inputs: [{ key: "in" }, { key: "item", type: "item" }],
    outputs: [{ key: "true" }, { key: "false" }],
} as const satisfies NodeSchema;

export { hasItemSchema };
