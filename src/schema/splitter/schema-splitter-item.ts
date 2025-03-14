const itemSplitterSchema = {
    in: true,
    outs: [{ key: "out" }],
    inputs: [{ key: "item", type: "item" }],
} as const satisfies ExtractDocumentSchema;

export { itemSplitterSchema };
