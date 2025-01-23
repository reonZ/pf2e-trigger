import { getAurasInMemory } from "helpers/helpers-aura";
import { actorsRespectAlliance } from "module-helpers";
import { insideAuraSchema } from "schema/condition/schema-inside-aura";
import { TriggerNode } from "../trigger-node";

class InsideAuraTriggerNode extends TriggerNode<typeof insideAuraSchema> {
    protected async _execute(target: TargetDocuments) {
        const existingAura = this.options.aura;

        if (existingAura) {
            this.setVariable("aura-source", existingAura.origin);

            this.send("target", target);
            this.send("source", existingAura.origin);

            return;
        }

        const slug = await this.get("slug");
        if (!slug?.trim()) {
            return this.send("false", target);
        }

        const targets = (await this.get("targets")) as "all" | "allies" | "enemies";
        const auras = getAurasInMemory(target.actor).filter(
            (aura) =>
                aura.data.slug === slug &&
                aura.origin.actor.uuid !== target.actor.uuid &&
                actorsRespectAlliance(aura.origin.actor, target.actor, targets)
        );

        if (!auras || !auras.length) {
            return this.send("false", target);
        }

        if (auras.length === 1) {
            const aura = auras[0];

            this.setVariable("aura-source", aura.origin);
            this.setOption("aura", aura);

            this.send("target", target);
            this.send("source", aura.origin);
        } else {
            for (const aura of auras) {
                this.executeTrigger({ aura });
            }
        }
    }
}

export { InsideAuraTriggerNode };
