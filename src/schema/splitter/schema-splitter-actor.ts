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
            key: "uuid",
            type: "uuid",
            label: "uuid-simple",
        },
        {
            key: "level",
            type: "number",
        },
    ],
} as const satisfies SplitterSchema;

export { actorSplitterSchema };
