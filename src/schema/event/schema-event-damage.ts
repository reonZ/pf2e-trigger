const damageReceivedSchema = {
    unique: true,
    outs: [{ key: "out" }],
    variables: [
        { key: "this", type: "target" },
        { key: "damage", type: "number" },
    ],
} as const satisfies EventSchema;

export { damageReceivedSchema };
