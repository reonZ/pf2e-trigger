import { NodeEntryType } from "data";
import { NodeRawSchema } from "schema/schema";

const itemSource = {
    inputs: [{ key: "uuid", type: "uuid", field: { document: "Item" } }],
    outputs: [{ key: "item", type: "item" }],
    document: "uuid",
} as const satisfies NodeRawSchema;

const dcTarget = {
    inputs: [
        { key: "target", type: "target" },
        { key: "item", type: "item" },
        { key: "against", type: "text" },
        {
            key: "adjustment",
            type: "number",
            field: {
                min: -10,
                max: 10,
                default: 0,
            },
        },
    ],
    outputs: [{ key: "dc", type: "dc" }],
} as const satisfies NodeRawSchema;

const dcValue = {
    inputs: [
        { key: "target", type: "target" },
        { key: "item", type: "item" },
        { key: "value", type: "number" },
    ],
    outputs: [{ key: "dc", type: "dc" }],
} as const satisfies NodeRawSchema;

const rollData = {
    inputs: [
        { key: "origin", type: "target" },
        { key: "item", type: "item" },
        { key: "options", type: "text" },
        { key: "traits", type: "text" },
    ],
    outputs: [{ key: "roll", type: "roll" }],
} as const satisfies NodeRawSchema;

const successValue = {
    inputs: [
        {
            key: "input",
            type: "select",
            field: {
                default: "success",
                options: [
                    {
                        value: "criticalFailure",
                        label: "PF2E.Check.Result.Degree.Check.criticalFailure",
                    },
                    {
                        value: "failure",
                        label: "PF2E.Check.Result.Degree.Check.failure",
                    },
                    {
                        value: "success",
                        label: "PF2E.Check.Result.Degree.Check.success",
                    },
                    {
                        value: "criticalSuccess",
                        label: "PF2E.Check.Result.Degree.Check.criticalSuccess",
                    },
                ],
            },
        },
    ],
    outputs: [{ key: "value", type: "number" }],
} as const satisfies NodeRawSchema;

const simpleDuration = {
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
    outputs: [{ key: "duration", type: "duration" }],
} as const satisfies NodeRawSchema;

const unitDuration = {
    inputs: [
        {
            key: "origin",
            type: "target",
        },
        {
            key: "value",
            type: "number",
            label: "PF2E.Time.Duration",
            field: {
                default: 1,
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
            label: "PF2E.Item.Effect.Expiry.ExpiresOn",
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
    outputs: [{ key: "duration", type: "duration" }],
} as const satisfies NodeRawSchema;

function createInputValue<T extends InputEntryType>(type: T): InputValueSchema<T> {
    return {
        inputs: [{ key: "input", type }],
        outputs: [{ key: "value", type }],
    };
}

type InputEntryType = "number" | "boolean" | "text";

type InputValueSchema<T extends NodeEntryType> = {
    inputs: [{ key: "input"; type: T }];
    outputs: [{ key: "value"; type: T }];
};

export const value = {
    "dc-target": dcTarget,
    "dc-value": dcValue,
    "duration-simple": simpleDuration,
    "duration-unit": unitDuration,
    "item-source": itemSource,
    "number-value": createInputValue("number"),
    "roll-data": rollData,
    "success-value": successValue,
    "text-value": createInputValue("text"),
};
