const successSplitterSchema = {
    in: true,
    outs: [
        {
            key: "3",
            label: "PF2E.Check.Result.Degree.Check.criticalSuccess",
        },
        {
            key: "2",
            label: "PF2E.Check.Result.Degree.Check.success",
        },
        {
            key: "1",
            label: "PF2E.Check.Result.Degree.Check.failure",
        },
        {
            key: "0",
            label: "PF2E.Check.Result.Degree.Check.criticalFailure",
        },
    ],
    inputs: [
        {
            key: "result",
            type: "number",
            field: {
                default: 2,
                min: 0,
                max: 3,
            },
        },
    ],
} as const satisfies SplitterSchema;

export { successSplitterSchema };
