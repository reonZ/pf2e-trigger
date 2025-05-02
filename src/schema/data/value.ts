function createInputValue<T extends InputEntryType>(type: T): InputValueSchema<T> {
    return {
        inputs: [{ key: "input", type }],
        outputs: [{ key: "value", type }],
    };
}

type InputEntryType = "number" | "boolean" | "text";

type InputValueSchema<T extends InputEntryType> = {
    inputs: [{ key: "input"; type: T }];
    outputs: [{ key: "value"; type: T }];
};

export const value = {
    "number-value": createInputValue("number"),
    "text-value": createInputValue("text"),
};
