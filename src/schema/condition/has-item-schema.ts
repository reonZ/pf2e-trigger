import { createConditionSchema } from "./condition-schema";

const hasItemSchema = createConditionSchema([{ key: "item", type: "item" }] as const);

export { hasItemSchema };
