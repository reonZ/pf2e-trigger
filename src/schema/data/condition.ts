import { BooleanOutsSchema, NodeRawSchema, booleanOutsSchema } from "schema";

const insideAura = {
    loop: true,
    outs: booleanOutsSchema(),
    inputs: [
        { key: "target", type: "target" },
        { key: "slug", type: "text" },
        {
            key: "targets",
            type: "select",
            field: {
                default: "enemies",
                options: ["all", "allies", "enemies"],
            },
        },
    ],
    outputs: [{ key: "source", type: "target" }],
} as const satisfies ConditionSchema;

const hasItem = {
    outs: booleanOutsSchema(),
    inputs: [
        { key: "target", type: "target" },
        { key: "uuid", type: "text" },
    ],
    outputs: [{ key: "item", type: "item" }],
    document: "uuid",
} as const satisfies ConditionSchema;

const hasOptions = {
    outs: booleanOutsSchema(),
    inputs: [
        { key: "target", type: "target" },
        { key: "option", type: "text" },
    ],
} as const satisfies ConditionSchema;

const inCombat = {
    outs: booleanOutsSchema(),
    inputs: [{ key: "target", type: "target" }],
} as const satisfies ConditionSchema;

const isCombatant = {
    outs: booleanOutsSchema(),
    inputs: [{ key: "target", type: "target" }],
} as const satisfies ConditionSchema;

const containsEntry = {
    outs: booleanOutsSchema(),
    inputs: [
        { key: "list", type: "list" },
        { key: "entry", type: "text" },
    ],
} as const satisfies ConditionSchema;

const matchPredicate = {
    outs: booleanOutsSchema(),
    inputs: [
        { key: "list", type: "list" },
        {
            key: "predicate",
            type: "text",
            label: "PF2E.RuleEditor.General.Predicate",
            field: {
                code: true,
                default: "[\n  \n]",
            },
        },
    ],
} as const satisfies ConditionSchema;

const hasCondition = {
    outs: booleanOutsSchema(),
    inputs: [
        { key: "target", type: "target" },
        {
            key: "condition",
            type: "select",
            field: {
                options: "CONFIG.Pf2eTrigger.addConditionTypes",
            },
        },
        {
            key: "counter",
            type: "number",
            label: "PF2E.Item.Effect.Badge.Type.counter",
            field: {
                default: 1,
                min: 1,
            },
        },
    ],
} as const satisfies ConditionSchema;

type ConditionSchema = Omit<NodeRawSchema, "icon" | "outs"> & {
    outs: BooleanOutsSchema;
};

export const condition = {
    "contains-entry": containsEntry,
    "has-condition": hasCondition,
    "has-item": hasItem,
    "has-option": hasOptions,
    "in-combat": inCombat,
    "inside-aura": insideAura,
    "is-combatant": isCombatant,
    "match-predicate": matchPredicate,
};
