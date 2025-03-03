import { createActionSchema } from "./schema-action";

const removeTemporarySchema = createActionSchema([
    {
        key: "slug",
        type: "text",
        label: "identifier",
        field: true,
    },
] as const);

export { removeTemporarySchema };
