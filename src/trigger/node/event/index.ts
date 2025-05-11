import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { EventTriggerNode } from "./event";
import { AuraTriggerNode } from "./aura";

export const event = {
    "aura-enter": AuraTriggerNode,
    "aura-leave": AuraTriggerNode,
    "test-event": EventTriggerNode,
    "token-create": EventTriggerNode,
    "token-delete": EventTriggerNode,
    "turn-end": EventTriggerNode,
    "turn-start": EventTriggerNode,
} as Record<NodeKeys<"event">, typeof TriggerNode>;
