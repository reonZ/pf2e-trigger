const eventSchema = {
    unique: true,
    outs: [{ key: "out" }],
    variables: [{ key: "this", type: "target" }],
} as const satisfies EventSchema;

export { eventSchema };
