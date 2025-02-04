import { createConditionSchema } from "./schema-condition";

const hasItemSchema = createConditionSchema(
    [{ key: "item", type: "item" }] as const,
    [{ key: "item", type: "item" }] as const
);

export { hasItemSchema };
