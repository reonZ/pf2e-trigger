import { ActorAura } from "hook";
import { actorsRespectAlliance, ActorTargetAlliance, isCurrentCombatant } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class AuraTriggerNode extends TriggerNode<NodeSchemaOf<"event", "aura-enter">> {
    async execute(): Promise<boolean> {
        const actor = this.target.actor;
        const aura = this.trigger.getOption("aura") as ActorAura;

        if (
            !aura ||
            !actor.inCombat ||
            aura.origin.actor.uuid === actor.uuid ||
            aura.data.slug !== (await this.get("slug")) ||
            ((await this.get("turn")) && !isCurrentCombatant(actor)) ||
            !actorsRespectAlliance(
                aura.origin.actor,
                actor,
                (await this.get("targets")) as ActorTargetAlliance
            )
        ) {
            return false;
        }

        this.setVariable("source", aura.origin);

        return this.send("out");
    }
}

export { AuraTriggerNode };
