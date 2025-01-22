import { ValueSchema } from "./schema-value";

const macroSourceSchema = {
    inputs: [{ key: "uuid", type: "uuid", field: true }],
    outputs: [{ key: "macro", type: "macro" }],
} as const satisfies ValueSchema;

export { macroSourceSchema };
