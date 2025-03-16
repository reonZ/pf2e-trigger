const conditionEventSchema = {
    unique: true,
    inputs: [
        {
            key: "condition",
            type: "select",
            field: {
                options: "CONFIG.Pf2eTrigger.addConditionTypes",
            },
        },
        {
            key: "update",
            type: "boolean",
            field: {
                default: true,
            },
        },
    ],
    outs: [{ key: "out" }],
    variables: [{ key: "this", type: "target" }],
} as const satisfies EventSchema;

export { conditionEventSchema };
