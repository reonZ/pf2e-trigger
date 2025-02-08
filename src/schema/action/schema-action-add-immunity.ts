const addImmunitySchema = {
    in: true,
    outs: [{ key: "out" }],
    inputs: [
        {
            key: "type",
            type: "select",
            field: {
                options: "CONFIG.PF2E.immunityTypes",
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
        {
            key: "exceptions",
            type: "label",
            label: "PF2E.Actor.IWREditor.Exceptions",
        },
    ],
} as const satisfies NodeRawSchema;

export { addImmunitySchema };
