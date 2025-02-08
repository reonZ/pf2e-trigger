import { ActorPF2e, ItemPF2e, R, getExtraRollOptions } from "module-helpers";
import { rollSaveSchema } from "schema/action/schema-action-roll-save";
import { TriggerNode } from "../trigger-node";

class RollSaveTriggerAction extends TriggerNode<typeof rollSaveSchema> {
    async execute(): Promise<void> {
        const save = await this.get("save");

        if (!R.isString(save)) {
            return this.send("out");
        }

        const rollData = await this.get("roll");
        const roller = rollData?.origin?.actor ?? this.target.actor;
        const statistic = roller.getStatistic(save);

        if (!statistic) {
            return this.send("out");
        }

        const dcData = (await this.get("dc")) ?? { value: 0 };

        const roll = await statistic.roll({
            dc: dcData,
            origin: dcData?.target?.actor,
            item: rollData?.item as ItemPF2e<ActorPF2e>,
            extraRollOptions: getExtraRollOptions(rollData),
            skipDialog: true,
        });

        this.setVariable("result", roll?.degreeOfSuccess ?? 2);
        return this.send("out");
    }
}

export { RollSaveTriggerAction };
