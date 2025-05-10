import { createCustomPersistentDamage, DamageType } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { getEffectData, TriggerNode } from "trigger";

class AddPersistentTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-persistent">> {
    async execute(): Promise<boolean> {
        const data = await getEffectData(this);

        if (!data) {
            return this.send("out");
        }

        const effect = createCustomPersistentDamage({
            ...data,
            dc: await this.get("dc"),
            die: (await this.get("die")) || "1d6",
            type: (await this.get("type")) as DamageType,
        });

        if (effect) {
            await data.actor.createEmbeddedDocuments("Item", [effect]);
        }

        return this.send("out");
    }
}

export { AddPersistentTriggerNode };
