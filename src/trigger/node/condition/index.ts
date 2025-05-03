import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { HasItemTriggerNode } from "./has-item";
import { InsideAuraTriggerNode } from "./inside-aura";
import { HasOptionTriggerNode } from "./has-option";

export const condition = {
    "has-item": HasItemTriggerNode,
    "has-option": HasOptionTriggerNode,
    "inside-aura": InsideAuraTriggerNode,
} as Record<NodeKeys<"condition">, typeof TriggerNode>;
