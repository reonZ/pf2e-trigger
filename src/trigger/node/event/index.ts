import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { AuraTriggerNode } from "./aura";
import { DamageTriggerNode } from "./damage";
import { EventTriggerNode } from "./event";
import { ExecuteTriggerNode } from "./execute";
import { RegionTriggerNode } from "./region";

export const event = {
    "aura-enter": AuraTriggerNode,
    "aura-leave": AuraTriggerNode,
    "damage-dealt": DamageTriggerNode,
    "damage-taken": DamageTriggerNode,
    "execute-event": ExecuteTriggerNode,
    "region-event": RegionTriggerNode,
    "test-event": EventTriggerNode,
    "token-create": EventTriggerNode,
    "token-delete": EventTriggerNode,
    "turn-end": EventTriggerNode,
    "turn-start": EventTriggerNode,
} as Record<NodeKeys<"event">, typeof TriggerNode>;
