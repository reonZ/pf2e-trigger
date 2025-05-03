import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";

export const subtrigger = {
    "subtrigger-input": TriggerNode,
    "subtrigger-node": TriggerNode,
    "subtrigger-output": TriggerNode,
} as Record<NodeKeys<"subtrigger">, typeof TriggerNode>;
