import { NodeRawSchema, NodeSchemaOutput } from "schema/schema";
import { schemaUnidentifiedEntry } from "./_utils";

const itemSource = {
    inputs: [{ key: "uuid", type: "uuid", field: { document: "Item" } }],
    outputs: [{ key: "item", type: "item" }],
    document: "uuid",
} as const satisfies ValueRawSchema;

const dcTarget = {
    inputs: [
        { key: "origin", type: "target" },
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
} as const satisfies ValueRawSchema;

const dcValue = {
    inputs: [
        { key: "origin", type: "target" },
        { key: "item", type: "item" },
        { key: "value", type: "number" },
    ],
    outputs: [{ key: "dc", type: "dc" }],
} as const satisfies ValueRawSchema;

const dcItem = {
    inputs: [
        { key: "origin", type: "target" },
        { key: "item", type: "item" },
        {
            key: "nb",
            type: "number",
            field: {
                default: 1,
                min: 1,
            },
        },
    ],
    outputs: [{ key: "dc", type: "dc" }],
} as const satisfies ValueRawSchema;

const rollData = {
    inputs: [
        { key: "origin", type: "target" },
        { key: "item", type: "item" },
        { key: "options", type: "text" },
        { key: "traits", type: "text" },
        { key: "note", type: "text" },
    ],
    outputs: [{ key: "roll", type: "roll" }],
} as const satisfies ValueRawSchema;

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
} as const satisfies ValueRawSchema;

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
} as const satisfies ValueRawSchema;

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
} as const satisfies ValueRawSchema;

const effectData = {
    inputs: [
        ...schemaUnidentifiedEntry(),
        { key: "label", type: "text" },
        { key: "image", type: "text" },
        { key: "duration", type: "duration" },
    ],
    outputs: [{ key: "effect", type: "effect" }],
    image: "image",
} as const satisfies ValueRawSchema;

const textValue = {
    inputs: [{ key: "input", type: "text" }],
    outputs: [{ key: "value", type: "text" }],
} as const satisfies ValueRawSchema;

const enrichedText = {
    inputs: [
        {
            key: "input",
            type: "text",
            field: {
                type: "enriched",
            },
        },
    ],
    outputs: [{ key: "value", type: "text" }],
} as const satisfies ValueRawSchema;

const numberValue = {
    inputs: [{ key: "input", type: "number" }],
    outputs: [{ key: "value", type: "number" }],
} as const satisfies ValueRawSchema;

const currentCombatant = {
    outputs: [{ key: "combatant", type: "target" }],
} as const satisfies ValueRawSchema;

const triggerIdentifier = {
    inputs: [
        { key: "key", type: "text" },
        { key: "target", type: "target" },
    ],
    outputs: [{ key: "identifier", type: "text" }],
} as const satisfies ValueRawSchema;

const namedLabelActor = {
    inputs: [
        { key: "prefix", type: "text" },
        { key: "target", type: "target" },
    ],
    outputs: [{ key: "label", type: "text" }],
} as const satisfies ValueRawSchema;

const namedLabelItem = {
    inputs: [
        { key: "prefix", type: "text" },
        { key: "item", type: "item" },
    ],
    outputs: [{ key: "label", type: "text" }],
} as const satisfies ValueRawSchema;

//

type ValueRawSchema = Pick<NodeRawSchema, "inputs" | "image" | "document"> & {
    outputs: [NodeSchemaOutput];
};

export const value = {
    "current-combatant": currentCombatant,
    "dc-item": dcItem,
    "dc-target": dcTarget,
    "dc-value": dcValue,
    "duration-simple": simpleDuration,
    "duration-unit": unitDuration,
    "effect-data": effectData,
    "enriched-text": enrichedText,
    "item-source": itemSource,
    "named-label-actor": namedLabelActor,
    "named-label-item": namedLabelItem,
    "number-value": numberValue,
    "roll-data": rollData,
    "success-value": successValue,
    "text-value": textValue,
    "trigger-identifier": triggerIdentifier,
};
