import { createConditionSchema } from "./schema-condition";

const hasOptionSchema = createConditionSchema([
    { key: "option", type: "text", field: true },
] as const);

export { hasOptionSchema };
