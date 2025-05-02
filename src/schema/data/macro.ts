import { NodeRawSchema } from "schema/schema";

const useMacro = {
    inputs: [{ type: "text", key: "uuid" }],
    document: "uuid",
    custom: [{ category: "inputs" }, { category: "outputs" }],
} as const satisfies NodeRawSchema;

export const macro = {
    "use-macro": useMacro,
};
