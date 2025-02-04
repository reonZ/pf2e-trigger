import { createConditionSchema } from "./schema-condition";

const hasOptionsSchema = createConditionSchema([
    { key: "option", type: "text", field: true },
] as const);

export { hasOptionsSchema };
