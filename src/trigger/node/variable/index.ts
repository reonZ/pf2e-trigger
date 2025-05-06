import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { GetterTriggerNode } from "./getter";
import { SetterTriggerNode } from "./setter";

export const variable = {
    "variable-getter": GetterTriggerNode,
    "variable-setter": SetterTriggerNode,
} as Record<NodeKeys<"variable">, typeof TriggerNode>;
