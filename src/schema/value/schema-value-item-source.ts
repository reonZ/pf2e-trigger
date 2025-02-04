const itemSourceSchema = {
    inputs: [{ key: "uuid", type: "uuid" }],
    variables: [{ key: "item", type: "item" }],
} as const satisfies SimpleValueSchema;

export { itemSourceSchema };
