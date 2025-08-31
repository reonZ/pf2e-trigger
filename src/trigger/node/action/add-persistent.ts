import { createCustomPersistentDamage, DamageType } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class AddPersistentTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-persistent">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const source = createCustomPersistentDamage({
            ...(await this.get("effect")),
            dc: await this.get("dc"),
            die: (await this.get("die")) || "1d6",
            type: (await this.get("type")) as DamageType,
        });

        if (source) {
            await actor.createEmbeddedDocuments("Item", [source]);
        }

        return this.send("out");
    }
}

export { AddPersistentTriggerNode };
