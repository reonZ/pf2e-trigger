import { NodeRawSchema, schemaConditionEntries, schemaUnidentifiedEntry } from "schema";

const rollDamage = {
    icon: "\uf6cf",
    inputs: [
        { key: "formula", type: "text" },
        { key: "roll", type: "roll" },
        { key: "target", type: "target" },
    ],
} as const satisfies NodeRawSchema;

const rollSave = {
    icon: "\uf6cf",
    inputs: [
        { key: "roll", type: "roll" },
        {
            key: "save",
            type: "select",
            field: { options: "CONFIG.PF2E.saves" },
        },
        { key: "dc", type: "dc" },
        { key: "basic", type: "boolean" },
    ],
    outputs: [{ key: "result", type: "number" }],
} as const satisfies NodeRawSchema;

const rollDamageWithSave = {
    icon: "\uf71c",
    inputs: [
        { key: "formula", type: "text" },
        { key: "target", type: "target" },
    ],
    module: "pf2e-toolbelt",
} as const satisfies NodeRawSchema;

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

const addCondition = {
    icon: { unicode: "\ue54d", fontWeight: "900" },
    inputs: [
        ...schemaConditionEntries("add"),
        ...schemaUnidentifiedEntry(),
        { key: "duration", type: "duration" },
        { key: "label", type: "text" },
        { key: "target", type: "target" },
    ],
} as const satisfies NodeRawSchema;

const reduceCondition = {
    icon: "\ue54d",
    inputs: [
        ...schemaConditionEntries("add"),
        {
            key: "min",
            type: "number",
            field: {
                default: 0,
                min: 0,
            },
        },
        { key: "target", type: "target" },
    ],
} as const satisfies NodeRawSchema;

const addTemporary = {} as const satisfies NodeRawSchema;

export const action = {
    "add-condition": addCondition,
    "console-log": consoleLog,
    "reduce-condition": reduceCondition,
    "roll-damage-with-save": rollDamageWithSave,
    "roll-damage": rollDamage,
    "roll-save": rollSave,
    "use-macro": useMacro,
};
