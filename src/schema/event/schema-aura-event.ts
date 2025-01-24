import { NodeSchema } from "schema/schema";

const auraEventSchema = {
    unique: ["inside-aura"],
    inputs: [
        { key: "slug", label: "aura-slug", type: "text", field: true },
        {
            key: "targets",
            type: "select",
            field: {
                default: "enemies",
                options: ["all", "allies", "enemies"],
            },
        },
    ],
    outputs: [{ key: "target" }, { key: "source" }],
    variables: [
        { key: "this", type: "target" },
        { key: "aura-source", type: "target" },
    ],
} as const satisfies NodeSchema;

export { auraEventSchema };
