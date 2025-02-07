import { getUnilimitedDuration } from "helpers/helpers-duration";
import {
    DamageType,
    EffectSource,
    GrantItemSource,
    PERSISTENT_DAMAGE_IMAGES,
    PersistentSourceData,
} from "module-helpers";
import { addPersistentSchema } from "schema/action/schema-action-add-persistent";
import { TriggerNode } from "../trigger-node";

class AddPersistentTriggerAction extends TriggerNode<typeof addPersistentSchema> {
    async execute(): Promise<void> {
        const actor = (await this.get("target"))?.actor ?? this.target.actor;
        const unided = !!(await this.get("unidentified"));

        const duration = (await this.get("duration")) ?? getUnilimitedDuration();
        const context = duration.context;
        delete duration.context;

        const condition = game.pf2e.ConditionManager.conditions.get("persistent-damage")!;

        if (duration.unit === "unlimited" && !unided && !origin) {
            const source = condition.toObject();
            await actor.createEmbeddedDocuments("Item", [source]);
        } else {
            const prefix = game.i18n.localize("TYPES.Item.effect");
            const damageType = (await this.get("type")) as DamageType;

            const rule: GrantItemSource = {
                key: "GrantItem",
                uuid: condition.uuid,
                onDeleteActions: {
                    grantee: "restrict",
                },
                inMemoryOnly: true,
                alterations: [
                    {
                        mode: "override",
                        property: "persistent-damage",
                        value: {
                            formula: (await this.get("die"))?.trim() || "1d6",
                            damageType,
                            dc: (await this.get("dc")) ?? 15,
                        } satisfies PersistentSourceData,
                    },
                ],
            };

            const effect: PreCreate<EffectSource> = {
                type: "effect",
                name: `${prefix}: ${condition.name}`,
                img: PERSISTENT_DAMAGE_IMAGES[damageType] ?? condition.img,
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

export { AddPersistentTriggerAction };
