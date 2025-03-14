const damageTakenSchema = {
    unique: true,
    outs: [{ key: "out" }],
    variables: [
        { key: "this", type: "target" },
        { key: "value", type: "number" },
    ],
} as const satisfies EventSchema;

export { damageTakenSchema };
