import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { EventTriggerNode } from "../event/event";
import { SubtriggerNodeTriggerNode } from "./node";
import { SubtriggerOutputTriggerNode } from "./output";

export const subtrigger = {
    "subtrigger-input": EventTriggerNode,
    "subtrigger-node": SubtriggerNodeTriggerNode,
    "subtrigger-output": SubtriggerOutputTriggerNode,
} as Record<NodeKeys<"subtrigger">, typeof TriggerNode>;
