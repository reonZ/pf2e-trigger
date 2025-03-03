import { createConditionSchema } from "./schema-condition";

const hasTemporarySchema = createConditionSchema([
    {
        key: "slug",
        type: "text",
        label: "identifier",
        field: true,
        connection: false,
    },
] as const);

export { hasTemporarySchema };
