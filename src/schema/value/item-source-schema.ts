import { ValueSchema } from "./value-schema";

const itemSourceSchema = {
    inputs: [{ key: "uuid", type: "uuid", field: true }],
    outputs: [{ key: "item", type: "item" }],
} as const satisfies ValueSchema;

export { itemSourceSchema };
