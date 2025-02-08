import { getUnilimitedDuration } from "helpers/helpers-duration";
import { ConditionSlug, EffectSource, GrantItemSource } from "module-helpers";
import { addConditionSchema } from "schema/action/schema-action-add-condition";
import { TriggerNode } from "../trigger-node";

class AddConditionTriggerNode extends TriggerNode<typeof addConditionSchema> {
    async execute(): Promise<void> {
        const slug = (await this.get("condition")) as ConditionSlug;
        const condition = game.pf2e.ConditionManager.conditions.get(slug);

        if (!condition) {
            return this.send("out");
        }

        const isValued = condition.system.value.isValued;
        const actor = (await this.get("target"))?.actor ?? this.target.actor;
        const counter = (await this.get("counter")) ?? 1;
        const unided = !!(await this.get("unidentified"));

        const duration = (await this.get("duration")) ?? getUnilimitedDuration();
        const context = duration.context;
        delete duration.context;

        if (duration.unit === "unlimited" && !unided && !context) {
            const source = condition.toObject();

            if (isValued && counter > 1) {
                source.system.value.value = Math.max(counter, 1);
            }

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

            if (isValued && counter > 1) {
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
                    context,
                },
            };

            await actor.createEmbeddedDocuments("Item", [effect]);
        }

        return this.send("out");
    }
}

export { AddConditionTriggerNode };
