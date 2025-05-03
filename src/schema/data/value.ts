import { NodeEntryType } from "data";
import { NodeRawSchema } from "schema/schema";

function createInputValue<T extends InputEntryType>(type: T): InputValueSchema<T> {
    return {
        inputs: [{ key: "input", type }],
        outputs: [{ key: "value", type }],
    };
}

const itemSourceSchema = {
    inputs: [{ key: "uuid", type: "text" }],
    outputs: [{ key: "item", type: "item" }],
    document: "uuid",
} as const satisfies NodeRawSchema;

type InputEntryType = "number" | "boolean" | "text";

type InputValueSchema<T extends NodeEntryType> = {
    inputs: [{ key: "input"; type: T }];
    outputs: [{ key: "value"; type: T }];
};

export const value = {
    "item-source": itemSourceSchema,
    "number-value": createInputValue("number"),
    "text-value": createInputValue("text"),
};
