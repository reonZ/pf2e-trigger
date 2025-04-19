import { NodeRawSchema, booleanOutsSchema } from "schema";

const insideAuraSchema = {
    outs: booleanOutsSchema(),
    inputs: [
        {
            key: "slug",
            type: "text",
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
    outputs: [
        {
            key: "aura-source",
            type: "target",
        },
    ],
} as const satisfies NodeRawSchema;

const condition = {
    "inside-aura": insideAuraSchema,
};

export { condition };
