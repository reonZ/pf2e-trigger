import { IconObject, NodeRawSchema } from "schema";

const eventSchema = {
    outputs: [
        {
            key: "this",
            type: "target",
        },
    ],
} as const satisfies NodeRawSchema;

function createEventSchema(icon: string | IconObject) {
    return {
        icon,
        outputs: [
            {
                key: "this",
                type: "target",
            },
        ],
    } as const satisfies NodeRawSchema;
}

const event = {
    "turn-start": eventSchema,
    "turn-end": eventSchema,
    "token-create": eventSchema,
    "token-delete": eventSchema,
    "test-event": createEventSchema("\ue4f3"),
};

export { event, eventSchema };
