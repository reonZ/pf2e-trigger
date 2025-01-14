import { NodeSchema } from "@schema/schema";

const hasItemSchema = {
    in: true,
    inputs: [{ key: "item", type: "item" }],
    outputs: [{ key: "true" }, { key: "false" }],
} as const satisfies NodeSchema;

export { hasItemSchema };
