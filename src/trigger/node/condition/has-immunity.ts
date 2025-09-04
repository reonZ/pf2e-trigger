import { objectHasKey } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class HasImmunityTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "has-immunity">> {
    async execute(): Promise<boolean> {
        const type = await this.get("type");
        const actor = await this.getTargetActor("target");
        const options = objectHasKey(CONFIG.PF2E.conditionTypes, type)
            ? ["item:type:condition", `item:slug:${type}`]
            : objectHasKey(CONFIG.PF2E.damageTypes, type)
            ? [`damage:type:${type}`]
            : objectHasKey(CONFIG.PF2E.materialDamageEffects, type)
            ? [`damage:material:${type}`]
            : [];

        const hasImmunity = !!actor?.system.attributes.immunities.some((immunity) => {
            return immunity.type === type || immunity.test(options);
        });

        return this.send(hasImmunity);
    }
}

export { HasImmunityTriggerNode };
