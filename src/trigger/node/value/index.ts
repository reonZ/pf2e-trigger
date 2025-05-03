import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { ItemSourceTriggerNode } from "./item-source";

export const value = {
    "item-source": ItemSourceTriggerNode,
    "number-value": TriggerNode,
    "text-value": TriggerNode,
} as Record<NodeKeys<"value">, typeof TriggerNode>;
