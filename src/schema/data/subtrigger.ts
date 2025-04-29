import { NodeRawSchema } from "schema/schema";

const input = {
    icon: "\uf2f6",
    outputs: [
        {
            key: "this",
            type: "target",
        },
    ],
    custom: [
        {
            category: "outputs",
        },
    ],
} as const satisfies NodeRawSchema;

const subtrigger = {
    "subtrigger-input": input,
    "subtrigger-output": {},
    "subtrigger-node": {},
};

export { subtrigger };
