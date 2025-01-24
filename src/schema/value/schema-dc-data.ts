import { ValueSchema } from "./schema-value";

const dcDataSchema = {
    inputs: [
        {
            key: "dc",
            type: "number",
            field: { min: 0, max: 30, step: 1, default: 15 },
        },
    ],
    outputs: [{ key: "dc", type: "dc" }],
} as const satisfies ValueSchema;

export { dcDataSchema };
