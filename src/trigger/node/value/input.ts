import { TriggerValue } from "trigger/trigger";
import { TriggerNode } from "trigger";

class InputValueTriggerNode extends TriggerNode {
    async query(): Promise<TriggerValue> {
        return this.get("input");
    }
}

export { InputValueTriggerNode };
