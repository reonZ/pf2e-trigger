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
} as const satisfies ConditionSchema;

const condition = {
    "inside-aura": insideAura,
};

type ConditionSchema = Omit<NodeRawSchema, "icon" | "outs" | "inputs"> & {
    outs: BooleanOutsSchema;
    inputs: [...NodeSchemaInput[], { type: "target"; key: "target" }];
};

export { condition };
