const macroSchema = {
    in: true,
    outs: [{ key: "out" }],
    inputs: [{ key: "uuid", type: "uuid", field: true, connection: false }],
} as const satisfies NodeRawSchema;

export { macroSchema };
