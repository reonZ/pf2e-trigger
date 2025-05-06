import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { HasItemTriggerNode } from "./has-item";
import { InsideAuraTriggerNode } from "./inside-aura";
import { HasOptionTriggerNode } from "./has-option";
import { IsCombatantTriggerNode } from "./is-combatant";
import { InCombatTriggerNode } from "./in-combat";

export const condition = {
    "contains-entry": {},
    "has-item": HasItemTriggerNode,
    "has-option": HasOptionTriggerNode,
    "in-combat": InCombatTriggerNode,
    "inside-aura": InsideAuraTriggerNode,
    "is-combatant": IsCombatantTriggerNode,
} as Record<NodeKeys<"condition">, typeof TriggerNode>;
