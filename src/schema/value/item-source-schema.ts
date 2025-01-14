import { NodeSchema } from "@schema/schema";

const itemSourceSchema = {
    inputs: [{ key: "uuid", type: "uuid", field: true }],
    outputs: [{ key: "item", type: "item" }],
} as const satisfies NodeSchema;

export { itemSourceSchema };
