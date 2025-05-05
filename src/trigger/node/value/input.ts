import { TriggerValue } from "trigger/trigger";
import { TriggerNode } from "../node";

class InputValueTriggerNode extends TriggerNode {
    async query(): Promise<TriggerValue> {
        return this.get("input");
    }
}

export { InputValueTriggerNode };
