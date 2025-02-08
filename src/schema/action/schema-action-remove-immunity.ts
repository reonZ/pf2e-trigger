import { createActionSchema } from "./schema-action";

const removeImmunitySchema = createActionSchema([
    {
        key: "type",
        type: "select",
        field: {
            options: "CONFIG.PF2E.immunityTypes",
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

export { removeImmunitySchema };
