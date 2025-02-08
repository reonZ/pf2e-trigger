import { createActionSchema } from "./schema-action";

const rollDamageSchema = createActionSchema([
    { key: "formula", type: "text", field: true },
    { key: "roll", type: "roll" },
] as const);

export { rollDamageSchema };
