import { isCurrentCombatant } from "module-helpers";
import { TriggerNode } from "../trigger-node";

class IsCombatantTriggerCondition extends TriggerNode<ConditionSchema> {
    async execute(): Promise<void> {
        const actor = await this.getTargetActor("target");
        return this.send(actor && isCurrentCombatant(actor) ? "true" : "false");
    }
}

export { IsCombatantTriggerCondition };
