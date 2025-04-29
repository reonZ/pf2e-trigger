import { NodeRawSchema } from "schema";

const rollDamage = {
    icon: "\uf71c",
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
} as const satisfies NodeRawActionSchema;

const rollSave = {
    icon: "\uf6cf",
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
} as const satisfies NodeRawActionSchema;

const rollDamageWithSave = {
    icon: "\uf71c",
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
} as const satisfies NodeRawActionSchema;

const action = {
    "roll-damage": rollDamage,
    "roll-save": rollSave,
    "roll-damage-with-save": rollDamageWithSave,
};

type NodeRawActionSchema = WithRequired<NodeRawSchema, "icon">;

export { action };
