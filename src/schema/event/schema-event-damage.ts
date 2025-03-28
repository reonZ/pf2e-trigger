const damageEventSchema = {
    unique: true,
    outs: [{ key: "out" }],
    variables: [
        { key: "this", type: "target" },
        { key: "other", type: "target" },
        { key: "item", type: "item" },
        { key: "heal", type: "boolean" },
        { key: "negated", type: "boolean" },
        { key: "options", type: "list" },
    ],
} as const satisfies EventSchema;

export { damageEventSchema };
