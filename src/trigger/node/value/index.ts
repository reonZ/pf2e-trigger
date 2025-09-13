import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { CurrentCombatantTriggerNode } from "./current-combatant";
import { DcItemTriggerNode } from "./dc-item";
import { DcTargetTriggerNode } from "./dc-target";
import { DcValueTriggerNode } from "./dc-value";
import { DurationSimpleTriggerNode } from "./duration-simple";
import { DurationUnitTriggerNode } from "./duration-unit";
import { EffectDataTriggerNode } from "./effect-data";
import { InputValueTriggerNode } from "./input";
import { ItemSourceTriggerNode } from "./item-source";
import { RollDataTriggerNode } from "./roll-data";
import { SuccessValueTriggerNode } from "./success";

export const value = {
    "current-combatant": CurrentCombatantTriggerNode,
    "dc-item": DcItemTriggerNode,
    "dc-target": DcTargetTriggerNode,
    "dc-value": DcValueTriggerNode,
    "duration-simple": DurationSimpleTriggerNode,
    "duration-unit": DurationUnitTriggerNode,
    "effect-data": EffectDataTriggerNode,
    "enriched-text": InputValueTriggerNode,
    "item-source": ItemSourceTriggerNode,
    "number-value": InputValueTriggerNode,
    "success-value": SuccessValueTriggerNode,
    "text-value": InputValueTriggerNode,
    "roll-data": RollDataTriggerNode,
} as Record<NodeKeys<"value">, typeof TriggerNode>;
