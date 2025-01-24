import { ActionSchema } from "./schema-action";

const rollDamageSchema = {
    in: true,
    inputs: [
        { key: "formula", type: "text", field: true },
        { key: "target", type: "target" },
        { key: "roll", type: "roll" },
    ],
    outputs: [{ key: "out" }],
} as const satisfies ActionSchema;

export { rollDamageSchema };
