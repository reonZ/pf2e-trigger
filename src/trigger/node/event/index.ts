import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { EventTriggerNode } from "./event";

export const event = {
    "test-event": EventTriggerNode,
    "token-create": EventTriggerNode,
    "token-delete": EventTriggerNode,
    "turn-end": EventTriggerNode,
    "turn-start": EventTriggerNode,
} as Record<NodeKeys<"event">, typeof TriggerNode>;
