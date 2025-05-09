export * from "./_utils";
import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { ConsoleLogTriggerNode } from "./console-log";
import { UseMacroTriggerNode } from "./use-macro";
import { RollDamageTriggerNode } from "./roll-damage";
import { RollSaveTriggerNode } from "./roll-save";
import { AddConditionTriggerNode } from "./add-condition";
import { ReduceConditionTriggerNode } from "./reduce-condition";
import { AddItemTriggerNode } from "./add-item";
import { AddTemporaryTriggerNode } from "./add-temorary";
import { RemoveTemporaryTriggerNode } from "./remove-temporary";

export const action = {
    "add-condition": AddConditionTriggerNode,
    "add-item": AddItemTriggerNode,
    "add-temporary": AddTemporaryTriggerNode,
    "console-log": ConsoleLogTriggerNode,
    "reduce-condition": ReduceConditionTriggerNode,
    "remove-temporary": RemoveTemporaryTriggerNode,
    "roll-damage": RollDamageTriggerNode,
    "roll-damage-with-save": TriggerNode,
    "roll-save": RollSaveTriggerNode,
    "use-macro": UseMacroTriggerNode,
} as Record<NodeKeys<"action">, typeof TriggerNode>;
