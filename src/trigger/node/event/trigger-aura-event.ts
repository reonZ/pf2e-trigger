import { actorsRespectAlliance, isCurrentCombatant } from "module-helpers";
import { auraEventSchema } from "schema/event/schema-aura-event";
import { TriggerNode } from "../trigger-node";

class AuraEventTriggerNode extends TriggerNode<typeof auraEventSchema> {
    protected async _execute(target: TargetDocuments) {
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
                (await this.get("targets")) as "all" | "allies" | "enemies"
            )
        )
            return;

        this.setVariable("aura-source", aura.origin);
        this.setOption("aura", aura);

        this.send("target", target);
        this.send("source", aura.origin);
    }
}

export { AuraEventTriggerNode };
