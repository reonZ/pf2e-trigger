import { ValueSchema } from "./schema-value";

const dcValueSchema = {
    inputs: [
        {
            key: "dc",
            type: "number",
            field: { min: 0, max: 30, step: 1, default: 15 },
        },
    ],
    outputs: [{ key: "dc", type: "dc" }],
} as const satisfies ValueSchema;

const dcTargetSchema = {
    inputs: [
        { key: "target", type: "target" },
        { key: "against", type: "text", field: true },
        {
            key: "adjustment",
            type: "number",
            field: {
                min: -10,
                max: 10,
                default: 0,
            },
        },
    ],
    outputs: dcValueSchema.outputs,
} as const satisfies ValueSchema;

export { dcValueSchema, dcTargetSchema };
