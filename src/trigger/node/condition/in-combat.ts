import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class InCombatTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "in-combat">> {
    async execute(): Promise<boolean> {
        const target = await this.getTarget("target");
        const sendKey = !!target?.actor.inCombat;
        return this.send(sendKey);
    }
}

export { InCombatTriggerNode };
