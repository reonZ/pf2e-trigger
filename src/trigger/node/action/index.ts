export * from "./_utils";
import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { AddConditionTriggerNode } from "./add-condition";
import { AddItemTriggerNode } from "./add-item";
import { AddPersistentTriggerNode } from "./add-persistent";
import { AddTemporaryTriggerNode } from "./add-temporary";
import { ConsoleLogTriggerNode } from "./console-log";
import { EffectDurationTriggerNode } from "./effect-duration";
import { GetChoicesetTriggerNode } from "./get-choiceset";
import { GetCombatantTriggerNode } from "./get-combatant";
import { ReduceConditionTriggerNode } from "./reduce-condition";
import { RemoveItemTriggerNode } from "./remove-item";
import { RemoveItemSourceTriggerNode } from "./remove-item-source";
import { RemoveTemporaryTriggerNode } from "./remove-temporary";
import { RollDamageTriggerNode } from "./roll-damage";
import { RollDamageSaveTriggerNode } from "./roll-damage-save";
import { RollSaveTriggerNode } from "./roll-save";
import { UseMacroTriggerNode } from "./use-macro";

export const action = {
    "add-condition": AddConditionTriggerNode,
    "add-item": AddItemTriggerNode,
    "add-persistent": AddPersistentTriggerNode,
    "add-temporary": AddTemporaryTriggerNode,
    "console-log": ConsoleLogTriggerNode,
    "effect-duration": EffectDurationTriggerNode,
    "get-choiceset": GetChoicesetTriggerNode,
    "get-combatant": GetCombatantTriggerNode,
    "reduce-condition": ReduceConditionTriggerNode,
    "remove-item": RemoveItemTriggerNode,
    "remove-item-source": RemoveItemSourceTriggerNode,
    "remove-temporary": RemoveTemporaryTriggerNode,
    "roll-damage": RollDamageTriggerNode,
    "roll-damage-save": RollDamageSaveTriggerNode,
    "roll-save": RollSaveTriggerNode,
    "use-macro": UseMacroTriggerNode,
} as Record<NodeKeys<"action">, typeof TriggerNode>;
