import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { ItemSourceTriggerNode } from "./item-source";
import { RollDataTriggerNode } from "./roll-data";
import { DcTargetTriggerNode } from "./dc-target";
import { DcValueTriggerNode } from "./dc-value";

export const value = {
    "dc-target": DcTargetTriggerNode,
    "dc-value": DcValueTriggerNode,
    "item-source": ItemSourceTriggerNode,
    "number-value": TriggerNode,
    "text-value": TriggerNode,
    "roll-data": RollDataTriggerNode,
} as Record<NodeKeys<"value">, typeof TriggerNode>;
