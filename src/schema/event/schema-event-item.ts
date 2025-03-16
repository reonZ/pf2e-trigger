const itemEventSchema = {
    unique: true,
    inputs: [{ key: "uuid", type: "uuid" }],
    outs: [{ key: "out" }],
    variables: [
        { key: "this", type: "target" },
        { key: "item", type: "item" },
    ],
} as const satisfies EventSchema;

export { itemEventSchema };
