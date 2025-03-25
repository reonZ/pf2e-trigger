import { getCombatantSchema } from "schema/action/schema-action-get-combatant";
import { TriggerNode } from "../trigger-node";

class GetCombatantTriggerAction extends TriggerNode<typeof getCombatantSchema> {
    async execute(): Promise<void> {
        const combatant = game.combat?.combatant;

        if (combatant?.actor) {
            const { actor, token } = combatant;
            this.setVariable("combatant", { actor, token });
        }

        return this.send("out");
    }
}

export { GetCombatantTriggerAction };
