import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";

export const variable = {
    "variable-getter": TriggerNode,
    "variable-setter": TriggerNode,
} as const satisfies Record<NodeKeys<"variable">, typeof TriggerNode>;
