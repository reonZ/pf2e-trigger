import { ActionSchema } from "./schema-action";

const runMacroSchema = {
    in: true,
    inputs: [{ key: "macro", type: "macro" }],
    outputs: [{ key: "true" }, { key: "false" }],
} as const satisfies ActionSchema;

export { runMacroSchema };
