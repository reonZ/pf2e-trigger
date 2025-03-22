import { getAurasInMemory } from "helpers/helpers-aura";
import { ActorPF2e, ActorTargetAlliance, actorsRespectAlliance } from "module-helpers";
import { insideAuraSchema } from "schema/condition/schema-condition-inside-aura";
import { TriggerNode } from "../trigger-node";

class InsideAuraTriggerCondition extends TriggerNode<typeof insideAuraSchema> {
    async getActorAuras(actor: ActorPF2e): Promise<ActorAura[]> {
        const slug = await this.get("slug");

        if (!slug.trim()) {
            return [];
        }

        const actorUuid = actor.uuid;
        const targets = (await this.get("targets")) as ActorTargetAlliance;

        return getAurasInMemory(actor).filter(
            (aura) =>
                aura.data.slug === slug &&
                aura.origin.actor.uuid !== actorUuid &&
                actorsRespectAlliance(aura.origin.actor, actor, targets)
        );
    }

    async execute(): Promise<void> {
        const aura = this.options.aura;

        if (aura) {
            this.setVariable("aura-source", aura.origin);
            return this.send("true");
        } else {
            return this.send("false");
        }
    }
}

export { InsideAuraTriggerCondition };
