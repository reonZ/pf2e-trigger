import { createConditionSchema } from "./condition-schema";

const hasItemSchema = createConditionSchema({
    inputs: [{ key: "item", type: "item" }],
});

export { hasItemSchema };
