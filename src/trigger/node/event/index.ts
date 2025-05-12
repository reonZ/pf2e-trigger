import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { EventTriggerNode } from "./event";
import { AuraTriggerNode } from "./aura";
import { DamageTriggerNode } from "./damage";
import { ExecuteTriggerNode } from "./execute";

export const event = {
    "aura-enter": AuraTriggerNode,
    "aura-leave": AuraTriggerNode,
    "damage-dealt": DamageTriggerNode,
    "damage-taken": DamageTriggerNode,
    "execute-event": ExecuteTriggerNode,
    "test-event": EventTriggerNode,
    "token-create": EventTriggerNode,
    "token-delete": EventTriggerNode,
    "turn-end": EventTriggerNode,
    "turn-start": EventTriggerNode,
} as Record<NodeKeys<"event">, typeof TriggerNode>;
