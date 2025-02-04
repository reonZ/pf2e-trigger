import { createAction } from "./schema-action";

const addConditionSchema = createAction([
    {
        key: "condition",
        type: "select",
        field: {
            options: "CONFIG.PF2E.conditionTypes",
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
