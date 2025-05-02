import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";

export const subtrigger = {
    "subtrigger-input": TriggerNode,
    "subtrigger-node": TriggerNode,
    "subtrigger-output": TriggerNode,
} as const satisfies Record<NodeKeys<"subtrigger">, typeof TriggerNode>;
