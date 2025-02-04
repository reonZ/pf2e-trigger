const auraEventSchema = {
    unique: ["inside-aura"],
    inputs: [
        {
            key: "slug",
            label: "aura-slug",
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
    outs: [{ key: "out" }],
    variables: [
        { key: "this", type: "target" },
        { key: "aura-source", type: "target" },
    ],
} as const satisfies EventSchema;

export { auraEventSchema };
