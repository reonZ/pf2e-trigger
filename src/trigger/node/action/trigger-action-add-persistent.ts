import { executeWithDuration } from "helpers/helpers-duration";
import {
    DamageType,
    GrantItemSource,
    PERSISTENT_DAMAGE_IMAGES,
    PersistentSourceData,
} from "module-helpers";
import { addPersistentSchema } from "schema/action/schema-action-add-persistent";
import { TriggerNode } from "../trigger-node";

class AddPersistentTriggerAction extends TriggerNode<typeof addPersistentSchema> {
    async execute(): Promise<void> {
        const actor = (await this.get("target"))?.actor ?? this.target.actor;
        const condition = game.pf2e.ConditionManager.conditions.get("persistent-damage")!;

        await executeWithDuration(
            this,
            actor,
            async () => {
                return condition.toObject();
            },
            async () => {
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

                return {
                    rule,
                    name: condition.name,
                    img: PERSISTENT_DAMAGE_IMAGES[damageType] ?? condition.img,
                };
            }
        );

        return this.send("out");
    }
}

export { AddPersistentTriggerAction };
