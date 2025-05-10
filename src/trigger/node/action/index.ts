export * from "./_utils";
import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { AddConditionTriggerNode } from "./add-condition";
import { AddItemTriggerNode } from "./add-item";
import { AddPersistentTriggerNode } from "./add-persistent";
import { AddTemporaryTriggerNode } from "./add-temporary";
import { ConsoleLogTriggerNode } from "./console-log";
import { ReduceConditionTriggerNode } from "./reduce-condition";
import { RemoveTemporaryTriggerNode } from "./remove-temporary";
import { RollDamageTriggerNode } from "./roll-damage";
import { RollSaveTriggerNode } from "./roll-save";
import { UseMacroTriggerNode } from "./use-macro";

export const action = {
    "add-condition": AddConditionTriggerNode,
    "add-item": AddItemTriggerNode,
    "add-persistent": AddPersistentTriggerNode,
    "add-temporary": AddTemporaryTriggerNode,
    "console-log": ConsoleLogTriggerNode,
    "reduce-condition": ReduceConditionTriggerNode,
    "remove-temporary": RemoveTemporaryTriggerNode,
    "roll-damage": RollDamageTriggerNode,
    "roll-damage-with-save": TriggerNode,
    "roll-save": RollSaveTriggerNode,
    "use-macro": UseMacroTriggerNode,
} as Record<NodeKeys<"action">, typeof TriggerNode>;
