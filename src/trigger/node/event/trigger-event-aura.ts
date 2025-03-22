import { auraEventSchema } from "schema/event/schema-event-aura";
import { TriggerNode } from "../trigger-node";
import { ActorTargetAlliance, actorsRespectAlliance, isCurrentCombatant } from "module-helpers";

class AuraTriggerEvent extends TriggerNode<typeof auraEventSchema> {
    async execute() {
        const actor = this.target.actor;
        const aura = this.options.aura;
        if (!aura || !actor.inCombat) return;

        const slug = await this.get("slug");
        if (!slug?.trim()) return;

        const currentTurn = await this.get("turn");
        if (currentTurn && !isCurrentCombatant(actor)) return;

        if (
            aura.data.slug !== slug ||
            aura.origin.actor.uuid === actor.uuid ||
            !actorsRespectAlliance(
                aura.origin.actor,
                actor,
                (await this.get("targets")) as ActorTargetAlliance
            )
        )
            return;

        this.setVariable("aura-source", aura.origin);
        return this.send("out");
    }
}

export { AuraTriggerEvent };
