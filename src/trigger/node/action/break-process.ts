import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class BreakProcessTriggerNode extends TriggerNode<NodeSchemaOf<"action", "break-process">> {
    async execute(): Promise<boolean> {
        return false;
    }
}

export { BreakProcessTriggerNode };
