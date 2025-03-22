const dcValueSchema = {
    inputs: [
        {
            key: "dc",
            type: "number",
            label: "value",
            field: {
                min: 0,
                step: 1,
                default: 15,
            },
            connection: true,
        },
    ],
    variables: [{ key: "dc", type: "dc" }],
} as const satisfies ValueSchema;

export { dcValueSchema };
