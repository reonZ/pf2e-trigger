const actorSplitterSchema = {
    in: true,
    outs: [
        {
            key: "out",
        },
    ],
    inputs: [
        {
            key: "target",
            type: "target",
        },
    ],
    variables: [
        {
            key: "name",
            type: "text",
        },
        {
            key: "level",
            type: "number",
        },
    ],
} as const satisfies SplitterSchema;

export { actorSplitterSchema };
