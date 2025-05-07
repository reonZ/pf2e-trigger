import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { BooleanSplitterTriggerNode } from "./boolean";
import { ActorSplitterTriggerNode, ItemSplitterTriggerNode } from "./document";
import { SuccessSplitterTriggerNode } from "./success";
import { TextSplitterTriggerNode } from "./text";

export const splitter = {
    "actor-splitter": ActorSplitterTriggerNode,
    "boolean-splitter": BooleanSplitterTriggerNode,
    "item-splitter": ItemSplitterTriggerNode,
    "success-splitter": SuccessSplitterTriggerNode,
    "text-splitter": TextSplitterTriggerNode,
} as Record<NodeKeys<"splitter">, typeof TriggerNode>;
