import { NonBridgeEntryType } from "data";
import { SchemaBooleanOuts, schemaBooleanOuts, IconObject, NodeRawSchema } from "schema";

const numberBetween = {
    icon: "\ue664",
    inputs: [
        { key: "value", type: "number" },
        {
            key: "gte",
            type: "number",
            field: {
                min: 0,
                step: 1,
                default: 0,
            },
        },
        {
            key: "lt",
            type: "number",
            field: {
                min: -1,
                step: 1,
                default: -1,
            },
        },
    ],
    outs: schemaBooleanOuts(),
} as const satisfies NodeRawSchema;

function createLogicSchema<T extends NonBridgeEntryType>(
    type: T,
    unicode: string,
    fontWeight: TextStyleFontWeight = "400"
): LogicSchema<T> {
    return {
        icon: { unicode, fontWeight },
        outs: schemaBooleanOuts(),
        inputs: [
            { type, key: "a" },
            { type, key: "b" },
        ],
    };
}

function createEqualsSchema<T extends NonBridgeEntryType>(type: T): LogicSchema<T> {
    return createLogicSchema(type, "\x3d");
}

function createNumberSchema(unicode: string): LogicSchema<"number"> {
    return createLogicSchema("number", unicode);
}

type LogicSchema<T extends NonBridgeEntryType> = {
    icon: IconObject;
    outs: SchemaBooleanOuts;
    inputs: [{ type: T; key: "a" }, { type: T; key: "b" }];
};

export const logic = {
    "eq-actor": createEqualsSchema("target"),
    "eq-number": createEqualsSchema("number"),
    "eq-text": createEqualsSchema("text"),
    "gt-number": createNumberSchema("\x3e"),
    "gte-number": createNumberSchema("\uf532"),
    "lt-number": createNumberSchema("\x3c"),
    "lte-number": createNumberSchema("\uf537"),
    "number-between": numberBetween,
};
