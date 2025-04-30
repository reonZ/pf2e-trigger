import { NodeRawSchema } from "schema";

const event = {
    "turn-start": createEventSchema("\uf251"),
    "turn-end": createEventSchema("\uf253"),
    "token-create": createEventSchema("\uf2bd", "900"),
    "token-delete": createEventSchema("\uf2bd"),
    "test-event": createEventSchema("\ue4f3"),
};

function createEventSchema(unicode: string, fontWeight: TextStyleFontWeight = "400") {
    return {
        icon: {
            unicode,
            fontWeight,
        },
        outputs: [
            {
                key: "this",
                type: "target",
            },
        ],
    } as const satisfies NodeRawSchema;
}

export { event };
