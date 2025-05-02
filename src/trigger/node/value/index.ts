import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";

export const value = {
    "number-value": TriggerNode,
    "text-value": TriggerNode,
} as const satisfies Record<NodeKeys<"value">, typeof TriggerNode>;
