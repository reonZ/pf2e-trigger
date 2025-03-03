import { createConditionSchema } from "./schema-condition";

const hasTemporarySchema = createConditionSchema([
    {
        key: "slug",
        type: "text",
        label: "identifier",
        field: true,
    },
] as const);

export { hasTemporarySchema };
