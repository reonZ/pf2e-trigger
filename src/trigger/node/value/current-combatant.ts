import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class CurrentCombatantTriggerNode extends TriggerNode<NodeSchemaOf<"value", "current-combatant">> {
    #cached: Maybe<TargetDocuments>;

    async query(): Promise<TargetDocuments | undefined> {
        if (this.#cached === undefined) {
            const { actor, token } = game.combat?.combatant ?? {};
            this.#cached = actor ? { actor, token: token ?? actor.token } : null;
        }

        return this.#cached ?? undefined;
    }
}

export { CurrentCombatantTriggerNode };
