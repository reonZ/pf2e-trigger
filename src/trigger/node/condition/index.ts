import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { HasItemTriggerNode } from "./has-item";
import { InsideAuraTriggerNode } from "./inside-aura";
import { HasOptionTriggerNode } from "./has-option";
import { IsCombatantTriggerNode } from "./is-combatant";
import { InCombatTriggerNode } from "./in-combat";
import { ContainsEntryTriggerNode } from "./contains-entry";
import { MatchPredicateTriggerNode } from "./match-predicate";
import { HasConditionTriggerNode } from "./has-condition";
import { HasTemporaryTriggerNode } from "./has-temporary";
import { InRangeTriggerNode } from "./in-range";

export const condition = {
    "contains-entry": ContainsEntryTriggerNode,
    "has-condition": HasConditionTriggerNode,
    "has-item": HasItemTriggerNode,
    "has-option": HasOptionTriggerNode,
    "has-temporary": HasTemporaryTriggerNode,
    "in-combat": InCombatTriggerNode,
    "in-range": InRangeTriggerNode,
    "inside-aura": InsideAuraTriggerNode,
    "is-combatant": IsCombatantTriggerNode,
    "match-predicate": MatchPredicateTriggerNode,
} as Record<NodeKeys<"condition">, typeof TriggerNode>;
