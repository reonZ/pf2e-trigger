export * from "./_utils";
export * from "./await-confirm";

import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { AddConditionTriggerNode } from "./add-condition";
import { AddNumberTriggerNode } from "./add-number";
import { AddPersistentTriggerNode } from "./add-persistent";
import { AddResourceTriggerNode } from "./add-resource";
import { AddTemporaryTriggerNode } from "./add-temporary";
import { AwaitConfirmTriggerNode } from "./await-confirm";
import { BreakProcessTriggerNode } from "./break-process";
import { ConcatTextsTriggerNode } from "./concat-texts";
import { ConsoleLogTriggerNode } from "./console-log";
import { CreateItemTriggerNode } from "./create-item";
import { CreateMessageTriggerNode } from "./create-message";
import { DeleteItemTriggerNode } from "./delete-item";
import { DistanceBetweenTriggerNode } from "./distance-between";
import { EffectDurationTriggerNode } from "./effect-duration";
import { GetChoicesetTriggerNode } from "./get-choiceset";
import { GetMasterTriggerNode } from "./get-master";
import { GetOptionValueActorTriggerNode } from "./get-option-value-actor";
import { GetOptionValueListTriggerNode } from "./get-option-value-list";
import { GetPercentTriggerNode } from "./get-percent";
import { GetResourceTriggerNode } from "./get-resource";
import { GiveItemTriggerNode } from "./give-item";
import { JoinListTriggerNode } from "./join-list";
import { RandomNumberTriggerNode } from "./random-number";
import { ReduceConditionTriggerNode } from "./reduce-condition";
import { ReduceResourceTriggerNode } from "./reduce-resource";
import { RemoveConditionTriggerNode } from "./remove-condition";
import { RemoveItemTriggerNode } from "./remove-item";
import { RemoveItemWithSlugTriggerNode } from "./remove-item-slug";
import { RemoveTemporaryTriggerNode } from "./remove-temporary";
import { ReplaceXTriggerNode } from "./replace-x";
import { ResolveFormulaTriggerNode } from "./resolve-formula";
import { RollDamageTriggerNode } from "./roll-damage";
import { RollDamageSaveTriggerNode } from "./roll-damage-save";
import { RollFlatTriggerNode } from "./roll-flat";
import { RollSaveTriggerNode } from "./roll-save";
import { SceneTokensTriggerNode } from "./scene-tokens";
import { SendToChatTriggerNode } from "./send-to-chat";
import { SubtractNumberTriggerNode } from "./subtract-number";
import { SurroundTextTriggerNode } from "./surround-text";
import { UseMacroTriggerNode } from "./use-macro";

export const action = {
    "add-condition": AddConditionTriggerNode,
    "add-number": AddNumberTriggerNode,
    "add-persistent": AddPersistentTriggerNode,
    "add-resource": AddResourceTriggerNode,
    "add-temporary": AddTemporaryTriggerNode,
    "await-confirm": AwaitConfirmTriggerNode,
    "break-process": BreakProcessTriggerNode,
    "concat-texts": ConcatTextsTriggerNode,
    "console-log": ConsoleLogTriggerNode,
    "create-item": CreateItemTriggerNode,
    "create-message": CreateMessageTriggerNode,
    "delete-item": DeleteItemTriggerNode,
    "distance-between": DistanceBetweenTriggerNode,
    "effect-duration": EffectDurationTriggerNode,
    "get-choiceset": GetChoicesetTriggerNode,
    "get-master": GetMasterTriggerNode,
    "get-option-value-actor": GetOptionValueActorTriggerNode,
    "get-option-value-list": GetOptionValueListTriggerNode,
    "get-percent": GetPercentTriggerNode,
    "get-resource": GetResourceTriggerNode,
    "give-item": GiveItemTriggerNode,
    "join-list": JoinListTriggerNode,
    "random-number": RandomNumberTriggerNode,
    "reduce-condition": ReduceConditionTriggerNode,
    "reduce-resource": ReduceResourceTriggerNode,
    "remove-condition": RemoveConditionTriggerNode,
    "remove-item": RemoveItemTriggerNode,
    "remove-item-slug": RemoveItemWithSlugTriggerNode,
    "remove-temporary": RemoveTemporaryTriggerNode,
    "replace-x": ReplaceXTriggerNode,
    "resolve-formula": ResolveFormulaTriggerNode,
    "roll-damage": RollDamageTriggerNode,
    "roll-damage-save": RollDamageSaveTriggerNode,
    "roll-flat": RollFlatTriggerNode,
    "roll-save": RollSaveTriggerNode,
    "scene-tokens": SceneTokensTriggerNode,
    "send-to-chat": SendToChatTriggerNode,
    "surround-text": SurroundTextTriggerNode,
    "subtract-number": SubtractNumberTriggerNode,
    "use-macro": UseMacroTriggerNode,
} as Record<NodeKeys<"action">, typeof TriggerNode>;
