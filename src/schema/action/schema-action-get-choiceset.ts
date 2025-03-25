const getChoicesetSchema = {
    in: true,
    outs: [{ key: "out" }],
    inputs: [
        { key: "item", type: "item" },
        { key: "flag", type: "text", field: true },
        { key: "option", type: "text", field: true },
    ],
    variables: [{ key: "selection", type: "text" }],
} as const satisfies NodeRawSchema;

export { getChoicesetSchema };
