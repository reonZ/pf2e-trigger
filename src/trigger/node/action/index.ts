import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { ConsoleLogTriggerNode } from "./console-log";
import { UseMacroTriggerNode } from "./use-macro";
import { RollDamageTriggerNode } from "./roll-damage";

export const action = {
    "console-log": ConsoleLogTriggerNode,
    "roll-damage": RollDamageTriggerNode,
    "roll-damage-with-save": TriggerNode,
    "roll-save": TriggerNode,
    "use-macro": UseMacroTriggerNode,
} as Record<NodeKeys<"action">, typeof TriggerNode>;
