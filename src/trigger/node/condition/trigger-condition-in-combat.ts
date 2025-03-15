import { TriggerNode } from "../trigger-node";

class InCombatTriggerCondition extends TriggerNode<ConditionSchema> {
    async execute(): Promise<void> {
        const actor = ((await this.get("target")) ?? this.target).actor;
        return this.send(actor.inCombat ? "true" : "false");
    }
}

export { InCombatTriggerCondition };
