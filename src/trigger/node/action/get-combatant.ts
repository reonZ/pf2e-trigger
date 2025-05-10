import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class GetCombatantTriggerNode extends TriggerNode<NodeSchemaOf<"action", "get-combatant">> {
    async execute(): Promise<boolean> {
        const { actor, token } = game.combat?.combatant ?? {};

        if (actor) {
            this.setVariable("combatant", {
                actor,
                token: token ?? actor.token,
            });
        }

        return this.send("out");
    }
}

export { GetCombatantTriggerNode };
