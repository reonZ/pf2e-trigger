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
} as const satisfies NodeSchema;

export { auraEventSchema };
