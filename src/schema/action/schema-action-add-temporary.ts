import { createActionSchema } from "./schema-action";

const addTemporarySchema = createActionSchema([
    {
        key: "slug",
        type: "text",
        label: "identifier",
        field: true,
        connection: false,
    },
    {
        key: "unidentified",
        type: "boolean",
        label: "PF2E.Item.Effect.Unidentified",
        field: {
            default: true,
        },
    },
    {
        key: "duration",
        type: "duration",
    },
] as const);

export { addTemporarySchema };
