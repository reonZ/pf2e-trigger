const dcValueSchema = {
    inputs: [
        {
            key: "dc",
            type: "number",
            field: {
                min: 0,
                step: 1,
                default: 15,
            },
        },
    ],
    variables: [{ key: "dc", type: "dc" }],
} as const satisfies ValueSchema;

export { dcValueSchema };
