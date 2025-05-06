import { isCurrentCombatant } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class IsCombatantTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "is-combatant">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");
        const sendKey = !!actor && isCurrentCombatant(actor);
        return this.send(sendKey);
    }
}

export { IsCombatantTriggerNode };
