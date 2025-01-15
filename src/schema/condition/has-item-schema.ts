import { ConditionSchema } from "./condition-schema";

const hasItemSchema = {
    in: true,
    inputs: [{ key: "item", type: "item" }],
    outputs: [{ key: "true" }, { key: "false" }],
} as const satisfies ConditionSchema;

export { hasItemSchema };
