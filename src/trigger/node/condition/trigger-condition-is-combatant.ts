import { isCurrentCombatant } from "module-helpers";
import { TriggerNode } from "../trigger-node";

class IsCombatantTriggerCondition extends TriggerNode<ConditionSchema> {
    async execute(): Promise<void> {
        const actor = ((await this.get("target")) ?? this.target).actor;
        return this.send(isCurrentCombatant(actor) ? "true" : "false");
    }
}

export { IsCombatantTriggerCondition };
