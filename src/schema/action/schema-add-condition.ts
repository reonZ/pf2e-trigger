import { ActionSchema } from "./schema-action";

const addConditionSchema = {
    in: true,
    inputs: [
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
        {
            key: "target",
            type: "target",
        },
    ],
    outputs: [{ key: "out" }],
} as const satisfies ActionSchema;

export { addConditionSchema };
