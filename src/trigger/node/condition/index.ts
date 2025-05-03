import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { HasItemTriggerNode } from "./has-item";
import { InsideAuraTriggerNode } from "./inside-aura";

export const condition = {
    "has-item": HasItemTriggerNode,
    "inside-aura": InsideAuraTriggerNode,
} as Record<NodeKeys<"condition">, typeof TriggerNode>;
