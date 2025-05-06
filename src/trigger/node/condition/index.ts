import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { HasItemTriggerNode } from "./has-item";
import { InsideAuraTriggerNode } from "./inside-aura";
import { HasOptionTriggerNode } from "./has-option";
import { IsCombatantTriggerNode } from "./is-combatant";
import { InCombatTriggerNode } from "./in-combat";
import { ContainsEntryTriggerNode } from "./contains-entry";
import { MatchPredicateTriggerNode } from "./match-predicate";

export const condition = {
    "contains-entry": ContainsEntryTriggerNode,
    "has-item": HasItemTriggerNode,
    "has-option": HasOptionTriggerNode,
    "in-combat": InCombatTriggerNode,
    "inside-aura": InsideAuraTriggerNode,
    "is-combatant": IsCombatantTriggerNode,
    "match-predicate": MatchPredicateTriggerNode,
} as Record<NodeKeys<"condition">, typeof TriggerNode>;
