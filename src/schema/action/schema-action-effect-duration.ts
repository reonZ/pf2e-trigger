const effectDurationSchema = {
    in: true,
    outs: [{ key: "out" }],
    inputs: [
        { key: "effect", type: "item" },
        {
            key: "value",
            type: "number",
            field: {
                default: -1,
                step: 1,
            },
        },
    ],
    variables: [{ key: "removed", type: "boolean" }],
} as const satisfies NodeRawSchema;

export { effectDurationSchema };
