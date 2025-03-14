const actorSplitterSchema = {
    in: true,
    outs: [{ key: "out" }],
    inputs: [{ key: "target", type: "target" }],
} as const satisfies ExtractDocumentSchema;

export { actorSplitterSchema };
