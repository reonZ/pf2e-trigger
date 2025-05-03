import { NodeSchemaOf } from "schema";
import { TriggerNode } from "../node";
import { getAurasInMemory } from "hook";
import { actorsRespectAlliance, ActorTargetAlliance } from "module-helpers";

class InsideAuraTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "inside-aura">> {
    async execute(): Promise<boolean> {
        const slug = await this.get("slug");
        const targets = (await this.get("targets")) as ActorTargetAlliance;
        const actor = await this.getTargetActor("target");

        if (!slug || !actor) {
            return this.send("false");
        }

        const auras = getAurasInMemory(actor).filter(({ data, origin }) => {
            return data.slug === slug && actorsRespectAlliance(origin.actor, actor, targets);
        });

        if (!auras.length) {
            return this.send("false");
        }

        for (const { origin } of auras) {
            this.setVariable("source", origin);
            await this.send("true");
        }

        return true;
    }
}

export { InsideAuraTriggerNode };
