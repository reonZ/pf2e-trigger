import { NodeRawSchema } from "schema/schema";

const setter = {
    icon: "\uf044",
} as const satisfies NodeRawSchema;

export const variable = {
    "variable-getter": {},
    "variable-setter": setter,
};
