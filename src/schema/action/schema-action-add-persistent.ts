import { createAction } from "./schema-action";

const addPersistentSchema = createAction([
    {
        key: "die",
        type: "text",
        label: "1d6",
        field: {
            default: "1d6",
        },
    },
    {
        key: "type",
        type: "select",
        field: {
            options: "CONFIG.PF2E.damageTypes",
        },
    },
    {
        key: "dc",
        type: "number",
        field: {
            default: 15,
            min: 0,
            max: 30,
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

export { addPersistentSchema };
