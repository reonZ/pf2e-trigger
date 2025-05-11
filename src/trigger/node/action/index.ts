export * from "./_utils";
import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { AddConditionTriggerNode } from "./add-condition";
import { AddPersistentTriggerNode } from "./add-persistent";
import { AddTemporaryTriggerNode } from "./add-temporary";
import { ConsoleLogTriggerNode } from "./console-log";
import { CreateItemTriggerNode } from "./create-item";
import { DeleteItemTriggerNode } from "./delete-item";
import { EffectDurationTriggerNode } from "./effect-duration";
import { GetChoicesetTriggerNode } from "./get-choiceset";
import { GetCombatantTriggerNode } from "./get-combatant";
import { ReduceConditionTriggerNode } from "./reduce-condition";
import { RemoveItemTriggerNode } from "./remove-item";
import { RemoveTemporaryTriggerNode } from "./remove-temporary";
import { RollDamageTriggerNode } from "./roll-damage";
import { RollDamageSaveTriggerNode } from "./roll-damage-save";
import { RollSaveTriggerNode } from "./roll-save";
import { UseMacroTriggerNode } from "./use-macro";

export const action = {
    "add-condition": AddConditionTriggerNode,
    "add-persistent": AddPersistentTriggerNode,
    "add-temporary": AddTemporaryTriggerNode,
    "console-log": ConsoleLogTriggerNode,
    "create-item": CreateItemTriggerNode,
    "delete-item": DeleteItemTriggerNode,
    "effect-duration": EffectDurationTriggerNode,
    "get-choiceset": GetChoicesetTriggerNode,
    "get-combatant": GetCombatantTriggerNode,
    "reduce-condition": ReduceConditionTriggerNode,
    "remove-item": RemoveItemTriggerNode,
    "remove-temporary": RemoveTemporaryTriggerNode,
    "roll-damage": RollDamageTriggerNode,
    "roll-damage-save": RollDamageSaveTriggerNode,
    "roll-save": RollSaveTriggerNode,
    "use-macro": UseMacroTriggerNode,
} as Record<NodeKeys<"action">, typeof TriggerNode>;
