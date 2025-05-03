import { BooleanOutsSchema, NodeRawSchema, NodeSchemaInput, booleanOutsSchema } from "schema";

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

type ConditionSchema = Omit<NodeRawSchema, "icon" | "outs" | "inputs"> & {
    outs: BooleanOutsSchema;
    inputs: [...NodeSchemaInput[], { type: "target"; key: "target" }];
};

export const condition = {
    "has-item": hasItem,
    "has-option": hasOptions,
    "inside-aura": insideAura,
};
