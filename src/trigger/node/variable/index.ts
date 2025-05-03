import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";

export const variable = {
    "variable-getter": TriggerNode,
    "variable-setter": TriggerNode,
} as Record<NodeKeys<"variable">, typeof TriggerNode>;
