import { auraEventSchema } from "schema/event/schema-event-aura";
import { TriggerNode } from "../trigger-node";
import { ActorTargetAlliance, actorsRespectAlliance, isCurrentCombatant } from "module-helpers";

class AuraTriggerEvent extends TriggerNode<typeof auraEventSchema> {
    async execute() {
        const target = this.target;
        const aura = this.options.aura;
        if (!aura || !isCurrentCombatant(target.actor)) return;

        const slug = await this.get("slug");
        if (!slug?.trim()) return;

        if (
            aura.data.slug !== slug ||
            aura.origin.actor.uuid === target.actor.uuid ||
            !actorsRespectAlliance(
                aura.origin.actor,
                target.actor,
                (await this.get("targets")) as ActorTargetAlliance
            )
        )
            return;

        this.setVariable("aura-source", aura.origin);
        return this.send("out");
    }
}

export { AuraTriggerEvent };
