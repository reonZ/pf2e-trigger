import { NodeRawSchema, schemaConditionEntries, schemaUnidentifiedEntry } from "schema";

const rollDamage = {
    icon: "\uf6cf",
    inputs: [
        { key: "formula", type: "text" },
        { key: "roll", type: "roll" },
        { key: "target", type: "target" },
    ],
} as const satisfies ActionRawSchema;

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
} as const satisfies ActionRawSchema;

const rollDamageWithSave = {
    icon: "\uf71c",
    inputs: [
        { key: "formula", type: "text" },
        { key: "target", type: "target" },
    ],
    module: "pf2e-toolbelt",
} as const satisfies ActionRawSchema;

const consoleLog = {
    icon: "\uf120",
    custom: [{ category: "inputs" }],
} as const satisfies ActionRawSchema;

const useMacro = {
    icon: "\uf121",
    inputs: [{ type: "uuid", key: "uuid", field: { document: "Macro" } }],
    document: "uuid",
    custom: [{ category: "inputs" }, { category: "outputs" }],
} as const satisfies ActionRawSchema;

const addItem = {
    icon: "\uf466",
    inputs: [
        { key: "uuid", type: "uuid", field: { document: "Item" } },
        { key: "duplicate", type: "boolean", field: { default: true } },
        { key: "target", type: "target" },
    ],
    outputs: [{ key: "item", type: "item" }],
    document: "uuid",
} as const satisfies ActionRawSchema;

const addCondition = {
    icon: { unicode: "\ue54d", fontWeight: "900" },
    inputs: [
        ...schemaConditionEntries("add"),
        ...schemaUnidentifiedEntry(),
        { key: "duration", type: "duration" },
        { key: "label", type: "text" },
        { key: "target", type: "target" },
    ],
} as const satisfies ActionRawSchema;

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
} as const satisfies ActionRawSchema;

const addTemporary = {
    icon: { unicode: "\uf017", fontWeight: "900" },
    inputs: [
        { key: "identifier", type: "text" },
        ...schemaUnidentifiedEntry(true),
        { key: "duration", type: "duration" },
        { key: "target", type: "target" },
    ],
} as const satisfies ActionRawSchema;

//

type ActionRawSchema = WithRequired<NodeRawSchema, "icon">;

export const action = {
    "add-condition": addCondition,
    "add-item": addItem,
    "add-temporary": addTemporary,
    "console-log": consoleLog,
    "reduce-condition": reduceCondition,
    "roll-damage-with-save": rollDamageWithSave,
    "roll-damage": rollDamage,
    "roll-save": rollSave,
    "use-macro": useMacro,
};
