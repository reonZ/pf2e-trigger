const itemSplitterSchema = {
    in: true,
    outs: [
        {
            key: "out",
        },
    ],
    inputs: [
        {
            key: "input",
            type: "item",
        },
    ],
    variables: [
        {
            key: "name",
            type: "text",
        },
        {
            key: "slug",
            type: "text",
        },
        {
            key: "level",
            type: "number",
        },
    ],
} as const satisfies SplitterSchema;

export { itemSplitterSchema };
