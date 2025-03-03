import { createActionSchema } from "./schema-action";

const removeTemporarySchema = createActionSchema([
    {
        key: "slug",
        type: "text",
        label: "identifier",
        field: true,
        connection: false,
    },
] as const);

export { removeTemporarySchema };
