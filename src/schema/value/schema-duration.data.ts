import { ValueSchema } from "./schema-value";

const durationSingleSchema = {
    outputs: [{ key: "duration", type: "duration" }],
} as const satisfies ValueSchema;

const durationUnitSchema = {
    inputs: [
        {
            key: "value",
            type: "number",
            label: "PF2E.Time.Duration",
            field: {
                default: 0,
                min: 0,
            },
        },
        {
            key: "unit",
            type: "select",
            field: {
                default: "rounds",
                options: [
                    { value: "days", label: "PF2E.Time.Unit.Days" },
                    { value: "hours", label: "PF2E.Time.Unit.Hours" },
                    { value: "minutes", label: "PF2E.Time.Unit.Minutes" },
                    { value: "rounds", label: "PF2E.Time.Unit.Rounds" },
                ],
            },
        },
        {
            key: "expiry",
            type: "select",
            field: {
                default: "turn-start",
                options: [
                    { value: "turn-start", label: "PF2E.Item.Effect.Expiry.StartOfTurn" },
                    { value: "turn-end", label: "PF2E.Item.Effect.Expiry.EndOfTurn" },
                    { value: "round-end", label: "PF2E.Item.Effect.Expiry.EndOfRound" },
                ],
            },
        },
    ],
    outputs: durationSingleSchema.outputs,
} as const satisfies ValueSchema;

export { durationSingleSchema, durationUnitSchema };
