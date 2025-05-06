import { NodeEntryId } from "data";
import { TriggerNode, TriggerValue } from "trigger";

class GetterTriggerNode extends TriggerNode {
    async query(): Promise<TriggerValue> {
        return this.trigger.getVariable(this.nodeTarget);
    }
}

interface GetterTriggerNode {
    get nodeTarget(): NodeEntryId;
}

export { GetterTriggerNode };
