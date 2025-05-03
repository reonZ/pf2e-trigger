import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { GetterTriggerNode } from "./getter";

export const variable = {
    "variable-getter": GetterTriggerNode,
    "variable-setter": TriggerNode,
} as Record<NodeKeys<"variable">, typeof TriggerNode>;
