import { createCustomPersistentDamage, DamageType } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { getEffectData, TriggerNode } from "trigger";

class AddPersistentTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-persistent">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const effect = createCustomPersistentDamage({
            ...(await getEffectData(this)),
            dc: await this.get("dc"),
            die: (await this.get("die")) || "1d6",
            type: (await this.get("type")) as DamageType,
            name: await this.get("label"),
        });

        if (effect) {
            await actor.createEmbeddedDocuments("Item", [effect]);
        }

        return this.send("out");
    }
}

export { AddPersistentTriggerNode };
