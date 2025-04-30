import { NodeRawSchema } from "schema/schema";

const input = {
    icon: "\uf2f6",
    outputs: [{ key: "this", type: "target" }],
    custom: [{ category: "outputs" }],
} as const satisfies NodeRawSchema;

const output = {
    icon: "\uf2f5",
    custom: [{ category: "inputs" }],
} as const satisfies NodeRawSchema;

const node = {
    icon: "\uf1e6",
} as const satisfies NodeRawSchema;

const subtrigger = {
    "subtrigger-input": input,
    "subtrigger-output": output,
    "subtrigger-node": node,
};

export { subtrigger };
