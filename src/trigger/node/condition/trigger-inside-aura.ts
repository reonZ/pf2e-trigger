import { insideAuraSchema } from "schema/condition/schema-inside-aura";
import { TriggerNode } from "../trigger-node";
import { ActorPF2e, actorsRespectAlliance } from "module-helpers";
import { ActorAura, getAurasInMemory } from "helpers/helpers-aura";

class InsideAuraTriggerNode extends TriggerNode<typeof insideAuraSchema> {
    async getActorAuras(actor: ActorPF2e): Promise<ActorAura[]> {
        const slug = await this.get("slug");

        if (!slug?.trim()) {
            return [];
        }

        const actorUuid = actor.uuid;
        const targets = (await this.get("targets")) as "all" | "allies" | "enemies";

        return getAurasInMemory(actor).filter(
            (aura) =>
                aura.data.slug === slug &&
                aura.origin.actor.uuid !== actorUuid &&
                actorsRespectAlliance(aura.origin.actor, actor, targets)
        );
    }

    protected async _execute(target: TargetDocuments) {
        const aura = this.options.aura;

        if (aura) {
            this.setVariable("aura-source", aura.origin);
            this.send("target", target);
            this.send("source", aura.origin);
        } else {
            this.send("false", target);
        }
    }
}

export { InsideAuraTriggerNode };
