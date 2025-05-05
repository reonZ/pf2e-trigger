import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { DcTargetTriggerNode } from "./dc-target";
import { DcValueTriggerNode } from "./dc-value";
import { InputValueTriggerNode } from "./input";
import { ItemSourceTriggerNode } from "./item-source";
import { RollDataTriggerNode } from "./roll-data";
import { SuccessValueTriggerNode } from "./success";

export const value = {
    "dc-target": DcTargetTriggerNode,
    "dc-value": DcValueTriggerNode,
    "item-source": ItemSourceTriggerNode,
    "number-value": InputValueTriggerNode,
    "success-value": SuccessValueTriggerNode,
    "text-value": InputValueTriggerNode,
    "roll-data": RollDataTriggerNode,
} as Record<NodeKeys<"value">, typeof TriggerNode>;
