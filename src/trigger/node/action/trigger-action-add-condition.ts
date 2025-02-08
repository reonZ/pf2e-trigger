import { executeWithDuration } from "helpers/helpers-duration";
import { ConditionSlug, GrantItemSource } from "module-helpers";
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

        await executeWithDuration(
            this,
            actor,
            async () => {
                const source = condition.toObject();

                if (isValued && counter > 1) {
                    source.system.value.value = Math.max(counter, 1);
                }

                return source;
            },
            async () => {
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

                return {
                    rule,
                    img: condition.img,
                    name: condition.name,
                };
            }
        );

        return this.send("out");
    }
}

export { AddConditionTriggerNode };
