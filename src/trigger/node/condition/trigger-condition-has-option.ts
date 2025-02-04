import { hasRollOption } from "module-helpers";
import { TriggerNode } from "../trigger-node";
import { hasOptionsSchema } from "schema/condition/schema-condition-has-option";

class HasOptionTriggerCondition extends TriggerNode<typeof hasOptionsSchema> {
    async execute(): Promise<void> {
        const option = await this.get("option");
        const target = (await this.get("target")) ?? this.target;
        const sendKey = !!option?.trim() && hasRollOption(target.actor, option) ? "true" : "false";

        return this.send(sendKey);
    }
}

export { HasOptionTriggerCondition };
