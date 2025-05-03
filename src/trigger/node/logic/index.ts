import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";

export const logic = {
    "eq-actor": TriggerNode,
    "eq-number": TriggerNode,
    "eq-text": TriggerNode,
    "gt-number": TriggerNode,
    "gte-number": TriggerNode,
    "lt-number": TriggerNode,
    "lte-number": TriggerNode,
} as Record<NodeKeys<"logic">, typeof TriggerNode>;
