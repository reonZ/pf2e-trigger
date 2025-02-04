const itemConverterSchema = {
    inputs: [{ key: "item", type: "item" }],
    variables: [{ key: "uuid", type: "uuid" }],
} as const satisfies NodeRawSchema;

export { itemConverterSchema };
