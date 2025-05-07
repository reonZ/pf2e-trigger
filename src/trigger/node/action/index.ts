import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { ConsoleLogTriggerNode } from "./console-log";
import { UseMacroTriggerNode } from "./use-macro";
import { RollDamageTriggerNode } from "./roll-damage";
import { RollSaveTriggerNode } from "./roll-save";
import { AddConditionTriggerNode } from "./add-condition";
import { ReduceConditionTriggerNode } from "./reduce-condition";

export const action = {
    "add-condition": AddConditionTriggerNode,
    "console-log": ConsoleLogTriggerNode,
    "reduce-condition": ReduceConditionTriggerNode,
    "roll-damage": RollDamageTriggerNode,
    "roll-damage-with-save": TriggerNode,
    "roll-save": RollSaveTriggerNode,
    "use-macro": UseMacroTriggerNode,
} as Record<NodeKeys<"action">, typeof TriggerNode>;
