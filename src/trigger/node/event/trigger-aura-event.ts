import { auraEventSchema } from "schema/event/schema-aura-event";
import { TriggerNode } from "../trigger-node";
import { TriggerExecuteOptions } from "trigger/trigger";
import { actorsRespectAlliance, isCurrentCombatant } from "module-helpers";

class AuraEventTriggerNode extends TriggerNode<typeof auraEventSchema> {
    protected async _execute(origin: TargetDocuments, options: TriggerExecuteOptions) {
        const aura = options.aura;
        const source = options.source;
        if (!aura || !source || !isCurrentCombatant(origin.actor)) return;

        const slug = await this.get("slug");
        if (!slug?.trim()) return;

        if (
            aura.slug !== slug ||
            source.actor.uuid === origin.actor.uuid ||
            !actorsRespectAlliance(
                source.actor,
                origin.actor,
                (await this.get("targets")) as "all" | "allies" | "enemies"
            )
        )
            return;

        this.send("target", origin, options);
        this.send("source", source, options);
    }
}

export { AuraEventTriggerNode };
