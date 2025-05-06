import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { BooleanSplitterTriggerNode } from "./boolean";
import { ActorSplitterTriggerNode, ItemSplitterTriggerNode } from "./document";

export const splitter = {
    "actor-splitter": ActorSplitterTriggerNode,
    "boolean-splitter": BooleanSplitterTriggerNode,
    "item-splitter": ItemSplitterTriggerNode,
    "string-list": TriggerNode,
    "success-splitter": TriggerNode,
} as Record<NodeKeys<"splitter">, typeof TriggerNode>;
