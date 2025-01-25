import { createConditionSchema } from "./schema-condition";

const hasItemSchema = createConditionSchema([{ key: "item", type: "item" }] as const, {
    variables: [{ key: "has-item", type: "item" }],
});

export { hasItemSchema };
