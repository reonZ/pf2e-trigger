import { NodeRawSchema } from "schema";

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
            { key: "this", type: "target" }, //
            {
                key: "source",
                type: "target",
                label: "condition.inside-aura",
            },
        ],
    } as const satisfies NodeRawSchema;
}

function createDamageSchema(unicode: string, fontWeight: TextStyleFontWeight = "400") {
    return {
        icon: { unicode, fontWeight },
        outputs: [
            { key: "this", type: "target" },
            {
                key: "other",
                type: "target",
            },
            {
                key: "item",
                type: "item",
                label: "event.damage-taken",
            },
            {
                key: "heal",
                type: "boolean",
                label: "event.damage-taken",
            },
            {
                key: "negated",
                type: "boolean",
                label: "event.damage-taken",
            },
            {
                key: "options",
                type: "list",
                label: "event.damage-taken",
            },
        ],
    } as const satisfies NodeRawSchema;
}

function createEventSchema(unicode: string, fontWeight: TextStyleFontWeight = "400") {
    return {
        icon: { unicode, fontWeight },
        outputs: [{ key: "this", type: "target" }],
    } as const satisfies NodeRawSchema;
}

export const event = {
    "aura-enter": createAuraSchema("\uf192", "900"),
    "aura-leave": createAuraSchema("\uf192"),
    "damage-dealt": createDamageSchema("\ue4dc", "900"),
    "damage-taken": createDamageSchema("\ue24b", "900"),
    "test-event": createEventSchema("\ue4f3"),
    "token-create": createEventSchema("\uf2bd", "900"),
    "token-delete": createEventSchema("\uf2bd"),
    "turn-end": createEventSchema("\uf253"),
    "turn-start": createEventSchema("\uf251"),
};
