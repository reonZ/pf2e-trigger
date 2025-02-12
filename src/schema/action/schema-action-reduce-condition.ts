import { createActionSchema } from "./schema-action";

const reduceConditionSchema = createActionSchema([
    {
        key: "condition",
        type: "select",
        field: {
            options: "CONFIG.Pf2eTrigger.reduceConditionTypes",
        },
    },
    {
        key: "value",
        type: "number",
        field: {
            default: 1,
            min: 1,
        },
    },
    {
        key: "min",
        type: "number",
        field: {
            min: 0,
        },
    },
] as const);

export { reduceConditionSchema };
