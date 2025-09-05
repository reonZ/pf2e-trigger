import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { ContainsEntryTriggerNode } from "./contains-entry";
import { HasConditionTriggerNode } from "./has-condition";
import { HasImmunityTriggerNode } from "./has-immunity";
import { HasItemTriggerNode } from "./has-item";
import { HasOptionTriggerNode } from "./has-option";
import { HasTemporaryTriggerNode } from "./has-temporary";
import { InCombatTriggerNode } from "./in-combat";
import { InRangeTriggerNode } from "./in-range";
import { InsideAuraTriggerNode } from "./inside-aura";
import { IsCombatantTriggerNode } from "./is-combatant";
import { IsDeadTriggerNode } from "./is-dead";
import { MatchPredicateTriggerNode } from "./match-predicate";

export const condition = {
    "contains-entry": ContainsEntryTriggerNode,
    "has-condition": HasConditionTriggerNode,
    "has-immunity": HasImmunityTriggerNode,
    "has-item": HasItemTriggerNode,
    "has-option": HasOptionTriggerNode,
    "has-temporary": HasTemporaryTriggerNode,
    "in-combat": InCombatTriggerNode,
    "in-range": InRangeTriggerNode,
    "inside-aura": InsideAuraTriggerNode,
    "is-combatant": IsCombatantTriggerNode,
    "is-dead": IsDeadTriggerNode,
    "match-predicate": MatchPredicateTriggerNode,
} as Record<NodeKeys<"condition">, typeof TriggerNode>;
