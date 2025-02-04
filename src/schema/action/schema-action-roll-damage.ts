import { createAction } from "./schema-action";

const rollDamageSchema = createAction([
    { key: "formula", type: "text", field: true },
    { key: "roll", type: "roll" },
] as const);

export { rollDamageSchema };
