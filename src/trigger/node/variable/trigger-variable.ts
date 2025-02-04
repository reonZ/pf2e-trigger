import { TriggerNode } from "../trigger-node";

class TriggerVariable extends TriggerNode {
    async query(key: string): Promise<TriggerEntryValue> {
        return this.get("input");
    }
}

export { TriggerVariable };
