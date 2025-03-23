import { booleanSchemaOuts } from "schema/schema";

const insideAuraSchema = {
    in: true,
    unique: true,
    outs: booleanSchemaOuts,
    inputs: [
        {
            key: "slug",
            type: "text",
            field: true,
        },
        {
            key: "targets",
            type: "select",
            field: {
                default: "enemies",
                options: ["all", "allies", "enemies"],
            },
        },
    ],
    variables: [{ key: "aura-source", type: "target" }],
} as const satisfies NodeRawSchema;

export { insideAuraSchema };
