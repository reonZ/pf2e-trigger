import { createConditionSchema } from "./schema-condition";

const hasConditionSchema = createConditionSchema([
    {
        key: "condition",
        type: "select",
        field: {
            options: "CONFIG.Pf2eTrigger.addConditionTypes",
        },
    },
    {
        key: "counter",
        type: "number",
        label: "PF2E.Item.Effect.Badge.Type.counter",
        field: {
            default: 1,
            min: 1,
        },
    },
] as const);

export { hasConditionSchema };
