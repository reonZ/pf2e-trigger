import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { AuraTriggerNode } from "./aura";
import { DamageTriggerNode } from "./damage";
import { EventTriggerNode } from "./event";
import { ExecuteTriggerNode } from "./execute";
import { RegionTriggerNode } from "./region";
import { AttackTriggerNode } from "./attack";
import { TokenMovedTriggerNode } from "./moved";

export const event = {
    "attack-roll": AttackTriggerNode,
    "aura-enter": AuraTriggerNode,
    "aura-leave": AuraTriggerNode,
    "combatant-create": EventTriggerNode,
    "combatant-delete": EventTriggerNode,
    "damage-taken": DamageTriggerNode,
    "execute-event": ExecuteTriggerNode,
    "region-event": RegionTriggerNode,
    "test-event": EventTriggerNode,
    "token-create": EventTriggerNode,
    "token-delete": EventTriggerNode,
    "token-moved": TokenMovedTriggerNode,
    "turn-end": EventTriggerNode,
    "turn-start": EventTriggerNode,
} as Record<NodeKeys<"event">, typeof TriggerNode>;
