import { BooleanOutsSchema, NodeRawSchema, booleanOutsSchema } from "schema";

const insideAura = {
    loop: true,
    outs: booleanOutsSchema(),
    inputs: [
        { key: "slug", type: "text" },
        {
            key: "targets",
            type: "select",
            field: {
                default: "enemies",
                options: ["all", "allies", "enemies"],
            },
        },
        { key: "target", type: "target" },
    ],
    outputs: [{ key: "source", type: "target" }],
} as const satisfies ConditionSchema;

const hasItem = {
    outs: booleanOutsSchema(),
    inputs: [
        { key: "uuid", type: "text" },
        { key: "target", type: "target" },
    ],
    outputs: [{ key: "item", type: "item" }],
    document: "uuid",
} as const satisfies ConditionSchema;

const hasOptions = {
    outs: booleanOutsSchema(),
    inputs: [
        { key: "option", type: "text" },
        { key: "target", type: "target" },
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

type ConditionSchema = Omit<NodeRawSchema, "icon" | "outs"> & {
    outs: BooleanOutsSchema;
};

export const condition = {
    "contains-entry": containsEntry,
    "has-item": hasItem,
    "has-option": hasOptions,
    "in-combat": inCombat,
    "inside-aura": insideAura,
    "is-combatant": isCombatant,
    "match-predicate": matchPredicate,
};
