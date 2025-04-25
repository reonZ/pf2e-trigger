import { NodeRawSchema } from "schema/schema";

function createInputValue(type: InputEntryType) {
    return {
        inputs: [{ key: "input", type }],
        outputs: [{ key: "value", type }],
    } as const satisfies NodeRawSchema;
}

const value = {
    "text-value": createInputValue("text"),
};

type InputEntryType = "number" | "boolean" | "text";

export { value };
