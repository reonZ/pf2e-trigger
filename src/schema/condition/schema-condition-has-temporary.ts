import { createConditionSchema } from "./schema-condition";

const hasTemporarySchema = createConditionSchema([
    {
        key: "slug",
        type: "text",
        label: "temporary-slug",
        field: true,
        connection: false,
    },
] as const);

export { hasTemporarySchema };
