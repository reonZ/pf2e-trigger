import { getAurasInMemory } from "helpers/helpers-aura";
import { actorsRespectAlliance, isCurrentCombatant } from "module-helpers";
import { insideAuraSchema } from "schema/condition/schema-inside-aura";
import { TriggerExecuteOptions } from "trigger/trigger";
import { TriggerNode } from "../trigger-node";

class InsideAuraTriggerNode extends TriggerNode<typeof insideAuraSchema> {
    protected async _execute(origin: TargetDocuments, options: TriggerExecuteOptions) {
        if (!isCurrentCombatant(origin.actor)) {
            return this.send("false", origin, options);
        }

        const slug = await this.get("slug");
        if (!slug?.trim()) {
            return this.send("false", origin, options);
        }

        const targets = (await this.get("targets")) as "all" | "allies" | "enemies";
        const auras = getAurasInMemory(origin.actor).filter(
            (aura) =>
                aura.data.slug === slug &&
                aura.origin.actor.uuid !== origin.actor.uuid &&
                actorsRespectAlliance(aura.origin.actor, origin.actor, targets)
        );

        if (!auras || !auras.length) {
            return this.send("false", origin, options);
        }

        for (const aura of auras) {
            const source = aura.origin;
            this.send("target", origin, { ...options, source, aura: aura.data });
            this.send("source", source, { ...options, source, aura: aura.data });
        }
    }
}

export { InsideAuraTriggerNode };
