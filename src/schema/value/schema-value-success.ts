const successValueSchema = {
    inputs: [
        {
            key: "input",
            type: "select",
            field: {
                default: "2",
                options: [
                    {
                        value: "3",
                        label: "PF2E.Check.Result.Degree.Check.criticalSuccess",
                    },
                    {
                        value: "2",
                        label: "PF2E.Check.Result.Degree.Check.success",
                    },
                    {
                        value: "1",
                        label: "PF2E.Check.Result.Degree.Check.failure",
                    },
                    {
                        value: "0",
                        label: "PF2E.Check.Result.Degree.Check.criticalFailure",
                    },
                ],
            },
        },
    ],
    variables: [{ key: "value", type: "number" }],
} as const satisfies ValueSchema;

export { successValueSchema };
