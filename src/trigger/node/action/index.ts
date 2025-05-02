import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { ConsoleLogTriggerNode } from "./console-log";

export const action = {
    "console-log": ConsoleLogTriggerNode,
    "roll-damage": TriggerNode,
    "roll-damage-with-save": TriggerNode,
    "roll-save": TriggerNode,
} as Record<NodeKeys<"action">, typeof TriggerNode>;
