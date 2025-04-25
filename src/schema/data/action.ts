import { NodeRawSchema } from "schema";

const rollDamage = {
    inputs: [
        {
            key: "formula",
            type: "text",
        },
        {
            key: "target",
            type: "target",
        },
    ],
} as const satisfies NodeRawSchema;

const rollSave = {
    inputs: [
        {
            key: "save",
            type: "select",
            field: {
                options: "CONFIG.PF2E.saves",
            },
        },
        {
            key: "dc",
            type: "dc",
        },
        {
            key: "roll",
            type: "roll",
        },
        {
            key: "basic",
            type: "boolean",
        },
    ],
    outputs: [
        {
            key: "result",
            type: "number",
        },
    ],
} as const satisfies NodeRawSchema;

const rollDamageWithSave = {
    inputs: [
        {
            key: "predicate",
            type: "text",
            field: {
                code: true,
            },
        },
        {
            key: "formula",
            type: "text",
        },
        {
            key: "test",
            type: "number",
            field: {
                min: 0,
                max: 10,
            },
        },
    ],
    module: "pf2e-toolbelt",
} as const satisfies NodeRawSchema;

const action = {
    "roll-damage": rollDamage,
    "roll-save": rollSave,
    "roll-damage-with-save": rollDamageWithSave,
};

export { action };
