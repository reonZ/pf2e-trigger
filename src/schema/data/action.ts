import { NodeRawSchema, NodeSchemaInput } from "schema";

const rollDamage = {
    icon: "\uf6cf",
    inputs: [
        { key: "formula", type: "text" },
        { key: "origin", type: "target" },
        { key: "item", type: "item" },
        { key: "options", type: "text" },
        { key: "traits", type: "text" },
        { key: "target", type: "target" },
    ],
} as const satisfies NodeRawActionSchema;

const rollSave = {
    icon: "\uf6cf",
    inputs: [
        {
            key: "save",
            type: "select",
            field: { options: "CONFIG.PF2E.saves" },
        },
        { key: "basic", type: "boolean" },
        { key: "target", type: "target" },
    ],
    outputs: [{ key: "result", type: "number" }],
} as const satisfies NodeRawActionSchema;

const rollDamageWithSave = {
    icon: "\uf71c",
    inputs: [
        { key: "formula", type: "text" },
        { key: "target", type: "target" },
    ],
    module: "pf2e-toolbelt",
} as const satisfies NodeRawActionSchema;

const consoleLog = {
    icon: "\uf120",
    custom: [{ category: "inputs" }],
} as const satisfies NodeRawSchema;

const useMacro = {
    icon: "\uf121",
    inputs: [{ type: "text", key: "uuid" }],
    document: "uuid",
    custom: [{ category: "inputs" }, { category: "outputs" }],
} as const satisfies NodeRawSchema;

type NodeRawActionSchema = Omit<WithRequired<NodeRawSchema, "icon">, "inputs" | "outs"> & {
    inputs: [...NodeSchemaInput[], { type: "target"; key: "target" }];
};

export const action = {
    "console-log": consoleLog,
    "roll-damage-with-save": rollDamageWithSave,
    "roll-damage": rollDamage,
    "roll-save": rollSave,
    "use-macro": useMacro,
};
