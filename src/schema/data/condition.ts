import {
    SchemaBooleanOuts,
    NodeRawSchema,
    schemaBooleanOuts,
    schemaConditionEntries,
} from "schema";

const insideAura = {
    loop: true,
    outs: schemaBooleanOuts(),
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
    outs: schemaBooleanOuts(),
    inputs: [
        { key: "target", type: "target" },
        {
            key: "uuid",
            type: "uuid",
            field: { document: "Item" },
        },
    ],
    outputs: [{ key: "item", type: "item" }],
    document: "uuid",
} as const satisfies ConditionSchema;

const hasOptions = {
    outs: schemaBooleanOuts(),
    inputs: [
        { key: "target", type: "target" },
        { key: "option", type: "text" },
    ],
} as const satisfies ConditionSchema;

const inCombat = {
    outs: schemaBooleanOuts(),
    inputs: [{ key: "target", type: "target" }],
} as const satisfies ConditionSchema;

const isCombatant = {
    outs: schemaBooleanOuts(),
    inputs: [{ key: "target", type: "target" }],
} as const satisfies ConditionSchema;

const containsEntry = {
    outs: schemaBooleanOuts(),
    inputs: [
        { key: "list", type: "list" },
        { key: "entry", type: "text" },
    ],
} as const satisfies ConditionSchema;

const matchPredicate = {
    outs: schemaBooleanOuts(),
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
    outs: schemaBooleanOuts(),
    inputs: [
        { key: "target", type: "target" }, //
        ...schemaConditionEntries("add"),
    ],
} as const satisfies ConditionSchema;

const hasTemporary = {
    outs: schemaBooleanOuts(),
    inputs: [
        { key: "target", type: "target" },
        { key: "trigger", type: "text" },
        { key: "identifier", type: "text" },
    ],
} as const satisfies ConditionSchema;

//

type ConditionSchema = Omit<NodeRawSchema, "icon" | "outs"> & {
    outs: SchemaBooleanOuts;
};

export const condition = {
    "contains-entry": containsEntry,
    "has-condition": hasCondition,
    "has-item": hasItem,
    "has-option": hasOptions,
    "has-temporary": hasTemporary,
    "in-combat": inCombat,
    "inside-aura": insideAura,
    "is-combatant": isCombatant,
    "match-predicate": matchPredicate,
};
