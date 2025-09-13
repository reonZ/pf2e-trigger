import { NodeEntryId } from "data";
import { TriggerNode, TriggerValue } from "trigger";

class GetterTriggerNode extends TriggerNode {
    async query(key: string): Promise<TriggerValue> {
        const targetNode = this.trigger.getNodeFromEntryId(this.nodeTarget);

        return targetNode?.type === "value"
            ? targetNode.query(key)
            : this.trigger.getVariable(this.nodeTarget);
    }
}

interface GetterTriggerNode {
    get nodeTarget(): NodeEntryId;
}

export { GetterTriggerNode };
