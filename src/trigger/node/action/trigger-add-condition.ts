import { ConditionSlug, EffectSource, GrantItemSource } from "module-helpers";
import { addConditionSchema } from "schema/action/schema-add-condition";
import { TriggerNode } from "../trigger-node";
import { getUnilimitedDuration } from "helpers/helpers-duration";

class AddConditionTriggerNode extends TriggerNode<typeof addConditionSchema> {
    protected async _execute(target: TargetDocuments) {
        const slug = (await this.get("condition")) as ConditionSlug;
        const condition = game.pf2e.ConditionManager.conditions.get(slug);
        if (!condition) return;

        const source = condition.toObject();
        const duration = (await this.get("duration")) ?? getUnilimitedDuration();
        const actor = (await this.get("target"))?.actor ?? this.options.this.actor;
        const counter = await this.get("counter");
        const unided = await this.get("unidentified");

        if ((!duration || duration.unit === "unlimited") && !unided) {
            source.system.value.value = Math.max(counter, 1);
            await actor.createEmbeddedDocuments("Item", [source]);
        } else {
            const prefix = game.i18n.localize("TYPES.Item.effect");

            const rule: GrantItemSource = {
                key: "GrantItem",
                uuid: condition.uuid,
                onDeleteActions: {
                    grantee: "restrict",
                },
                inMemoryOnly: true,
            };

            if (counter > 1) {
                rule.alterations = [
                    {
                        mode: "override",
                        property: "badge-value",
                        value: counter,
                    },
                ];
            }

            const effect: PreCreate<EffectSource> = {
                type: "effect",
                name: `${prefix}: ${condition.name}`,
                img: condition.img,
                system: {
                    tokenIcon: { show: false },
                    unidentified: unided,
                    duration,
                    rules: [rule],
                },
            };

            await actor.createEmbeddedDocuments("Item", [effect]);
        }

        return this.send("out", target);
    }
}

export { AddConditionTriggerNode };
