import { NodeRawSchema, NodeSchemaOutput } from "schema";

const executeEvent = {
    icon: "\uf144",
    outputs: [{ key: "this", type: "target" }],
    custom: [{ category: "outputs" }],
} as const satisfies EventNodeSchema;

const regionEvent = {
    icon: "\uf867",
    outputs: [
        { key: "this", type: "target" },
        { key: "event", type: "text" },
    ],
} as const satisfies EventNodeSchema;

const attackRoll = {
    icon: "\uf71c",
    outputs: [
        { key: "this", type: "target" },
        { key: "other", type: "target" },
        { key: "item", type: "item" },
        { key: "outcome", type: "number" },
        { key: "action", type: "text" },
        { key: "options", type: "list" },
    ],
} as const satisfies EventNodeSchema;

const damageTaken = {
    icon: { unicode: "\ue4dc", fontWeight: "900" },
    outputs: [
        { key: "this", type: "target" },
        { key: "other", type: "target" },
        { key: "item", type: "item" },
        { key: "heal", type: "boolean" },
        { key: "negated", type: "boolean" },
        { key: "options", type: "list" },
    ],
} as const satisfies EventNodeSchema;

const tokenMoved = {
    icon: "\uf554",
    outputs: [
        { key: "this", type: "target" },
        { key: "data", type: "object" },
    ],
} as const satisfies EventNodeSchema;

//

function createAuraSchema(unicode: string, fontWeight: TextStyleFontWeight = "400") {
    return {
        icon: { unicode, fontWeight },
        inputs: [
            {
                key: "slug",
                type: "text",
                label: "condition.inside-aura",
            },
            {
                key: "targets",
                type: "select",
                field: {
                    default: "enemies",
                    options: ["all", "allies", "enemies"],
                },
            },
            {
                key: "turn",
                type: "boolean",
                label: "event.aura-enter",
                field: {
                    default: true,
                },
            },
        ],
        outputs: [
            { key: "this", type: "target" },
            {
                key: "source",
                type: "target",
                label: "condition.inside-aura",
            },
        ],
    } as const satisfies EventNodeSchema;
}

function createEventSchema(unicode: string, fontWeight: TextStyleFontWeight = "400") {
    return {
        icon: { unicode, fontWeight },
        outputs: [{ key: "this", type: "target" }],
    } as const satisfies EventNodeSchema;
}

//

type EventNodeSchema = Omit<WithRequired<NodeRawSchema, "icon">, "outputs"> & {
    outputs: ReadonlyArray<{ key: "this"; type: "target" } | NodeSchemaOutput>;
};

export const event = {
    "attack-roll": attackRoll,
    "aura-enter": createAuraSchema("\uf192", "900"),
    "aura-leave": createAuraSchema("\uf192"),
    "combatant-create": createEventSchema("\uf71d"),
    "combatant-delete": createEventSchema("\ue433"),
    "damage-taken": damageTaken,
    "execute-event": executeEvent,
    "region-event": regionEvent,
    "test-event": createEventSchema("\ue4f3"),
    "token-create": createEventSchema("\uf2bd", "900"),
    "token-delete": createEventSchema("\uf2bd"),
    "token-moved": tokenMoved,
    "turn-end": createEventSchema("\uf253"),
    "turn-start": createEventSchema("\uf251"),
};
