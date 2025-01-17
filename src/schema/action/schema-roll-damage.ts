import { ActionSchema } from "./schema-action";

const rollDamageSchema = {
    in: true,
    inputs: [
        {
            key: "formula",
            type: "text",
            field: true,
        },
    ],
    outputs: [{ key: "out" }],
} as const satisfies ActionSchema;

export { rollDamageSchema };
