import { NonBridgeEntryType } from "data";
import { BooleanOutsSchema, booleanOutsSchema, IconObject } from "schema";

function createLogicSchema<T extends NonBridgeEntryType>(
    type: T,
    unicode: string,
    fontWeight: TextStyleFontWeight = "400"
): LogicSchema<T> {
    return {
        icon: {
            unicode,
            fontWeight,
        },
        outs: booleanOutsSchema(),
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
    outs: BooleanOutsSchema;
    inputs: [{ type: T; key: "a" }, { type: T; key: "b" }];
};

export const logic = {
    "eq-number": createEqualsSchema("number"),
    "gt-number": createNumberSchema("\x3e"),
    "gte-number": createNumberSchema("\uf532"),
    "lt-number": createNumberSchema("\x3c"),
    "lte-number": createNumberSchema("\uf537"),
    "eq-text": createEqualsSchema("text"),
    "eq-actor": createEqualsSchema("target"),
};
