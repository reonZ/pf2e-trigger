import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";
import { EqActorTriggerNode } from "./actor";
import {
    EqNumberTriggerNode,
    GteNumberTriggerNode,
    GtNumberTriggerNode,
    LteNumberTriggerNode,
    LtNumberTriggerNode,
} from "./number";
import { EqTextTriggerNode } from "./text";

export const logic = {
    "eq-actor": EqActorTriggerNode,
    "eq-number": EqNumberTriggerNode,
    "eq-text": EqTextTriggerNode,
    "gt-number": GtNumberTriggerNode,
    "gte-number": GteNumberTriggerNode,
    "lt-number": LtNumberTriggerNode,
    "lte-number": LteNumberTriggerNode,
} as Record<NodeKeys<"logic">, typeof TriggerNode>;
