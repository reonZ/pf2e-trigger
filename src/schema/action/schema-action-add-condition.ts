import { createActionSchema } from "./schema-action";

const addConditionSchema = createActionSchema([
    {
        key: "condition",
        type: "select",
        field: {
            options: "CONFIG.Pf2eTrigger.conditionTypes",
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
    {
        key: "unidentified",
        type: "boolean",
        label: "PF2E.Item.Effect.Unidentified",
        field: true,
    },
    {
        key: "duration",
        type: "duration",
    },
] as const);

export { addConditionSchema };
