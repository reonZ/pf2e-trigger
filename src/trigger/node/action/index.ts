export * from "./_utils";
import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { AddConditionTriggerNode } from "./add-condition";
import { AddNumberTriggerNode } from "./add-number";
import { AddPersistentTriggerNode } from "./add-persistent";
import { AddTemporaryTriggerNode } from "./add-temporary";
import { BreakProcessTriggerNode } from "./break-process";
import { ConsoleLogTriggerNode } from "./console-log";
import { CreateItemTriggerNode } from "./create-item";
import { CreateMessageTriggerNode } from "./create-message";
import { DeleteItemTriggerNode } from "./delete-item";
import { DistanceBetweenTriggerNode } from "./distance-between";
import { EffectDurationTriggerNode } from "./effect-duration";
import { GetChoicesetTriggerNode } from "./get-choiceset";
import { GetCombatantTriggerNode } from "./get-combatant";
import { GiveItemTriggerNode } from "./give-item";
import { ReduceConditionTriggerNode } from "./reduce-condition";
import { RemoveItemTriggerNode } from "./remove-item";
import { RemoveTemporaryTriggerNode } from "./remove-temporary";
import { RollDamageTriggerNode } from "./roll-damage";
import { RollDamageSaveTriggerNode } from "./roll-damage-save";
import { RollFlatTriggerNode } from "./roll-flat";
import { RollSaveTriggerNode } from "./roll-save";
import { SceneTokensTriggerNode } from "./scene-tokens";
import { SubtractNumberTriggerNode } from "./subtract-number";
import { UseMacroTriggerNode } from "./use-macro";

export const action = {
    "add-condition": AddConditionTriggerNode,
    "add-number": AddNumberTriggerNode,
    "add-persistent": AddPersistentTriggerNode,
    "add-temporary": AddTemporaryTriggerNode,
    "break-process": BreakProcessTriggerNode,
    "console-log": ConsoleLogTriggerNode,
    "create-item": CreateItemTriggerNode,
    "create-message": CreateMessageTriggerNode,
    "delete-item": DeleteItemTriggerNode,
    "distance-between": DistanceBetweenTriggerNode,
    "effect-duration": EffectDurationTriggerNode,
    "get-choiceset": GetChoicesetTriggerNode,
    "get-combatant": GetCombatantTriggerNode,
    "give-item": GiveItemTriggerNode,
    "reduce-condition": ReduceConditionTriggerNode,
    "remove-item": RemoveItemTriggerNode,
    "remove-temporary": RemoveTemporaryTriggerNode,
    "roll-damage": RollDamageTriggerNode,
    "roll-damage-save": RollDamageSaveTriggerNode,
    "roll-flat": RollFlatTriggerNode,
    "roll-save": RollSaveTriggerNode,
    "scene-tokens": SceneTokensTriggerNode,
    "subtract-number": SubtractNumberTriggerNode,
    "use-macro": UseMacroTriggerNode,
} as Record<NodeKeys<"action">, typeof TriggerNode>;
