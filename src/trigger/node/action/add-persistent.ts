import {
    createCustomPersistentDamage,
    createPersistentDamageSource,
    DamageType,
} from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class AddPersistentTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-persistent">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const dc = await this.get("dc");
        const die = (await this.get("die")) || "1d6";
        const effect = await this.get("effect");
        const type = (await this.get("type")) as DamageType;

        const source = effect
            ? createCustomPersistentDamage({ ...effect, dc, die, type })
            : createPersistentDamageSource(die, type, dc);

        if (source) {
            await actor.createEmbeddedDocuments("Item", [source]);
        }

        return this.send("out");
    }
}

export { AddPersistentTriggerNode };
