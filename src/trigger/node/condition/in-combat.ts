import { isInCombat } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class InCombatTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "in-combat">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");
        const sendKey = !!(actor && isInCombat(actor));

        return this.send(sendKey);
    }
}

export { InCombatTriggerNode };
