import { NodeRawSchema, schemaConditionEntries } from "schema";

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
        { key: "basic", type: "boolean", label: "action.roll-save" },
    ],
    outputs: [{ key: "result", type: "number" }],
} as const satisfies ActionRawSchema;

const rollDamageSave = {
    icon: "\uf71c",
    inputs: [
        ...rollSave.inputs.slice(1).map((input) => {
            return {
                ...input,
                group: "save",
            };
        }),
        ...rollDamage.inputs.map((input) => {
            return {
                ...input,
                group: "damage",
            };
        }),
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
    custom: [
        { category: "inputs" }, //
        { category: "outputs" },
    ],
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
        ...schemaConditionEntries("add"), //
        { key: "effect", type: "effect" },
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
        { key: "effect", type: "effect" },
        { key: "target", type: "target" },
    ],
    image: "image",
} as const satisfies ActionRawSchema;

const removeTemporary = {
    icon: "\uf017",
    inputs: [
        { key: "trigger", type: "text" },
        { key: "identifier", type: "text" },
        { key: "target", type: "target" },
    ],
} as const satisfies ActionRawSchema;

const addPersistent = {
    icon: "\uf780",
    inputs: [
        {
            key: "die",
            type: "text",
        },
        {
            key: "type",
            type: "select",
            field: {
                options: "CONFIG.PF2E.damageTypes",
            },
        },
        {
            key: "dc",
            type: "number",
            field: {
                default: 15,
                min: 0,
            },
        },
        { key: "effect", type: "effect" },
        { key: "target", type: "target" },
    ],
} as const satisfies ActionRawSchema;

const removeItem = {
    icon: "\uf1f8",
    inputs: [
        { key: "item", type: "item" },
        { key: "target", type: "target" },
    ],
} as const satisfies ActionRawSchema;

const removeSourceItem = {
    icon: "\uf1f8",
    inputs: [
        {
            key: "uuid",
            type: "uuid",
            field: { document: "Item" },
        },
        { key: "target", type: "target" },
    ],
    document: "uuid",
} as const satisfies ActionRawSchema;

const getChoiceset = {
    icon: "\uf03a",
    inputs: [
        { key: "item", type: "item" },
        { key: "flag", type: "text" },
        { key: "option", type: "text" },
    ],
    outputs: [{ key: "selection", type: "text" }],
} as const satisfies ActionRawSchema;

const getCombatant = {
    icon: "\ue2bf",
    outputs: [{ key: "combatant", type: "target" }],
} as const satisfies ActionRawSchema;

const effectDuration = {
    icon: "\ue29e",
    inputs: [
        { key: "effect", type: "item" },
        {
            key: "value",
            type: "number",
            field: {
                default: -1,
                step: 1,
            },
        },
    ],
    outputs: [{ key: "removed", type: "boolean" }],
} as const satisfies ActionRawSchema;

//

type ActionRawSchema = WithRequired<NodeRawSchema, "icon">;

export const action = {
    "add-condition": addCondition,
    "add-item": addItem,
    "add-persistent": addPersistent,
    "add-temporary": addTemporary,
    "console-log": consoleLog,
    "effect-duration": effectDuration,
    "get-choiceset": getChoiceset,
    "get-combatant": getCombatant,
    "reduce-condition": reduceCondition,
    "remove-item": removeItem,
    "remove-item-source": removeSourceItem,
    "remove-temporary": removeTemporary,
    "roll-damage-save": rollDamageSave,
    "roll-damage": rollDamage,
    "roll-save": rollSave,
    "use-macro": useMacro,
};
