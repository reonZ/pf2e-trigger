import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { InsideAuraTriggerNode } from "./inside-aura";

export const condition = {
    "inside-aura": InsideAuraTriggerNode,
} as Record<NodeKeys<"condition">, typeof TriggerNode>;
