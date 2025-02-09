function createAddIwrSchema(options: IwrConfig, withValue?: boolean) {
    return {
        in: true,
        outs: [{ key: "out" }],
        inputs: [
            {
                key: "value",
                type: "number",
                field: {
                    min: 1,
                    default: 5,
                },
            },
            {
                key: "type",
                type: "select",
                field: {
                    options,
                },
            },
            {
                key: "unidentified",
                type: "boolean",
                label: "PF2E.Item.Effect.Unidentified",
                field: true,
            },
            {
                key: "duration",
                type: "duration",
            },
            {
                key: "target",
                type: "target",
            },
        ],
    } as const satisfies NodeRawSchema;
}

export { createAddIwrSchema };
