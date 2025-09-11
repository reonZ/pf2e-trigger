import { NodeRawSchema, schemaConditionEntries } from "schema";

const randomNumber = {
    icon: "\ue3dd",
    inputs: [
        {
            key: "min",
            type: "number",
            field: { step: 1 },
        },
        {
            key: "max",
            type: "number",
            field: { default: 10, step: 1 },
        },
    ],
    outputs: [{ key: "result", type: "number" }],
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
        {
            key: "basic",
            type: "boolean",
            label: "action.roll-save",
        },
        {
            key: "private",
            type: "boolean",
        },
    ],
    outputs: [{ key: "result", type: "number" }],
} as const satisfies ActionRawSchema;

const rollFlat = {
    icon: "\uf6cf",
    inputs: [
        {
            key: "dc",
            type: "number",
            field: {
                default: 15,
            },
        },
        { key: "target", type: "target" },
    ],
    outputs: [{ key: "result", type: "number" }],
} as const satisfies ActionRawSchema;

const rollDamage = {
    icon: "\uf71c",
    inputs: [
        { key: "formula", type: "text" },
        { key: "roll", type: "roll" },
        { key: "target", type: "target" },
    ],
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

const createMessage = {
    icon: "\uf4b6",
    inputs: [
        {
            key: "message",
            type: "text",
            field: {
                type: "description",
            },
        },
        { key: "target", type: "target" },
    ],
} as const satisfies ActionRawSchema;

const createItem = {
    icon: "\uf466",
    inputs: [
        { key: "uuid", type: "uuid", field: { document: "Item" } },
        { key: "duplicate", type: "boolean", field: { default: true } },
        { key: "target", type: "target" },
    ],
    outputs: [{ key: "item", type: "item" }],
    document: "uuid",
} as const satisfies ActionRawSchema;

const giveItem = {
    icon: "\uf2b5",
    inputs: [
        { key: "item", type: "item" },
        {
            key: "quantity",
            type: "number",
            field: { min: 1, default: 1 },
        },
        { key: "target", type: "target" },
    ],
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
        ...schemaConditionEntries("reduce"),
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

const removeCondition = {
    icon: "\ue54d",
    inputs: [
        {
            key: "condition",
            type: "select",
            field: {
                options: "CONFIG.Pf2eTrigger.addConditionTypes",
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

const deleteItem = {
    icon: "\uf1f8",
    inputs: [{ key: "item", type: "item" }],
} as const satisfies ActionRawSchema;

const removeItem = {
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

const getMaster = {
    icon: "\uf501",
    inputs: [{ key: "target", type: "target" }],
    outputs: [{ key: "master", type: "target" }],
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

const sceneTokens = {
    loop: true,
    icon: "\uf0c0",
    outputs: [{ key: "other", type: "target" }],
} as const satisfies ActionRawSchema;

const breakProcess = {
    icon: { unicode: "\uf049", fontWeight: "900" },
} as const satisfies ActionRawSchema;

const distanceBetween = {
    icon: "\ue068",
    inputs: [
        { key: "a", type: "target" },
        { key: "b", type: "target" },
    ],
    outputs: [{ key: "distance", type: "number" }],
} as const satisfies ActionRawSchema;

const concatTexts = {
    icon: "\uf894",
    inputs: [
        { key: "a", type: "text" },
        { key: "b", type: "text" },
        {
            key: "separator",
            type: "text",
            field: {
                default: "",
                trim: false,
            },
        },
    ],
    outputs: [{ key: "result", type: "text" }],
} as const satisfies ActionRawSchema;

const surroundText = {
    icon: "\uf035",
    inputs: [
        { key: "input", type: "text" },
        {
            key: "prefix",
            type: "text",
            field: {
                default: "",
                trim: false,
            },
        },
        {
            key: "suffix",
            type: "text",
            field: {
                default: "",
                trim: false,
            },
        },
    ],
    outputs: [{ key: "result", type: "text" }],
} as const satisfies ActionRawSchema;

const joinList = {
    icon: "\uf5ff",
    inputs: [
        { key: "list", type: "list" },
        {
            key: "separator",
            type: "text",
            field: {
                default: ",",
                trim: false,
            },
        },
    ],
    outputs: [{ key: "result", type: "text" }],
} as const satisfies ActionRawSchema;

function arithmeticAction(unicode: string, fontWeight: TextStyleFontWeight = "400") {
    return {
        icon: { unicode, fontWeight },
        inputs: [
            {
                key: "a",
                type: "number",
                field: { default: 1 },
            },
            {
                key: "b",
                type: "number",
                field: { default: 1 },
            },
        ],
        outputs: [{ key: "result", type: "number" }],
    } as const satisfies ActionRawSchema;
}

//

type ActionRawSchema = WithRequired<NodeRawSchema, "icon">;

export const action = {
    "add-condition": addCondition,
    "add-number": arithmeticAction("\ue59e"),
    "add-persistent": addPersistent,
    "add-temporary": addTemporary,
    "break-process": breakProcess,
    "concat-texts": concatTexts,
    "console-log": consoleLog,
    "create-item": createItem,
    "create-message": createMessage,
    "delete-item": deleteItem,
    "distance-between": distanceBetween,
    "effect-duration": effectDuration,
    "get-choiceset": getChoiceset,
    "get-combatant": getCombatant,
    "get-master": getMaster,
    "give-item": giveItem,
    "join-list": joinList,
    "random-number": randomNumber,
    "reduce-condition": reduceCondition,
    "remove-condition": removeCondition,
    "remove-item": removeItem,
    "remove-temporary": removeTemporary,
    "roll-damage-save": rollDamageSave,
    "roll-damage": rollDamage,
    "roll-flat": rollFlat,
    "roll-save": rollSave,
    "scene-tokens": sceneTokens,
    "subtract-number": arithmeticAction("\uf068"),
    "surround-text": surroundText,
    "use-macro": useMacro,
};
