import { NodeKeys } from "schema";
import { TriggerNode } from "trigger";

export const macro = {
    "use-macro": TriggerNode,
} as const satisfies Record<NodeKeys<"macro">, typeof TriggerNode>;
