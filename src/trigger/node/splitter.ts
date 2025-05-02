import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";

export const splitter = {
    "actor-splitter": TriggerNode,
    "boolean-splitter": TriggerNode,
    "item-splitter": TriggerNode,
} as const satisfies Record<NodeKeys<"splitter">, typeof TriggerNode>;
