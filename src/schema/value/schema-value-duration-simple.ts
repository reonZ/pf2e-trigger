const simpleDurationSchema = {
    inputs: [
        {
            key: "unit",
            type: "select",
            field: {
                options: [
                    { value: "unlimited", label: "PF2E.Time.Unit.Unlimited" },
                    { value: "encounter", label: "PF2E.Time.Unit.UntilEncounterEnds" },
                ],
            },
        },
    ],
    variables: [{ key: "duration", type: "duration" }],
} as const satisfies ValueSchema;

export { simpleDurationSchema };
