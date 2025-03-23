import { containsValueSchema } from "schema/condition/schema-condition-contains-value";
import { TriggerNode } from "../trigger-node";

class ContainsValueTriggerCondition extends TriggerNode<typeof containsValueSchema> {
    async execute(): Promise<void> {
        const value = (await this.get("value")).trim();
        const list = await this.get("list");
        const sendKey = value && list.includes(value) ? "true" : "false";

        return this.send(sendKey);
    }
}

export { ContainsValueTriggerCondition };
