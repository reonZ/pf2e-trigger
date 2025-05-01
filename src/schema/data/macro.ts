import { NodeRawSchema } from "schema/schema";

const useMacro = {
    inputs: [{ type: "text", key: "uuid" }],
    document: { icon: true, field: "uuid" },
    custom: [{ category: "inputs" }, { category: "outputs" }],
} as const satisfies NodeRawSchema;

const macro = {
    "use-macro": useMacro,
};

export { macro };
