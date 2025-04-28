import { NodeRawSchema } from "schema/schema";

const setter = {
    icon: "\uf044",
} as const satisfies NodeRawSchema;

const variable = {
    "variable-getter": {},
    "variable-setter": setter,
};

export { variable };
