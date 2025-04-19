import { NodeRawSchema } from "schema";

const rollDamageSchema = {
    inputs: [
        {
            key: "formula",
            type: "text",
        },
        {
            key: "roll",
            type: "roll",
        },
    ],
} as const satisfies NodeRawSchema;

const rollSaveSchema = {
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

const action = {
    "roll-damage": rollDamageSchema,
    "roll-save": rollSaveSchema,
};

export { action };
