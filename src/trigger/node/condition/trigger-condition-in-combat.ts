import { TriggerNode } from "../trigger-node";

class InCombatTriggerCondition extends TriggerNode<ConditionSchema> {
    async execute(): Promise<void> {
        const actor = await this.getTargetActor("target");
        return this.send(actor?.inCombat ? "true" : "false");
    }
}

export { InCombatTriggerCondition };
