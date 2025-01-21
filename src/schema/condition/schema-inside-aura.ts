import { BaseConditionSchema } from "./schema-condition";

const insideAuraSchema = {
    in: true,
    isUnique: true,
    inputs: [
        { key: "slug", type: "text", field: true },
        {
            key: "targets",
            type: "select",
            field: {
                default: "enemies",
                options: ["all", "allies", "enemies"],
            },
        },
    ],
    outputs: [{ key: "target" }, { key: "source" }, { key: "false" }],
} as const satisfies BaseConditionSchema;

export { insideAuraSchema };
