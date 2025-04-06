import { ActorPF2e, ItemPF2e, getExtraRollOptions } from "module-helpers";
import { rollSaveSchema } from "schema/action/schema-action-roll-save";
import { TriggerNode } from "../trigger-node";

class RollSaveTriggerAction extends TriggerNode<typeof rollSaveSchema> {
    async execute(): Promise<void> {
        const save = await this.get("save");
        const rollData = await this.get("roll");

        if (rollData?.origin === null) {
            return this.send("out");
        }

        const roller = rollData?.origin?.actor ?? this.target.actor;
        const statistic = roller.getStatistic(save);

        if (!statistic) {
            return this.send("out");
        }

        const isBasic = await this.get("basic");
        const dcData = (await this.get("dc")) ?? { value: 0 };

        const traits = rollData?.traits;
        const options = rollData?.options ?? [];

        if (isBasic) {
            options.push("damaging-effect");
        }

        const roll = await statistic.roll({
            dc: dcData,
            origin: dcData?.target?.actor,
            item: rollData?.item as ItemPF2e<ActorPF2e>,
            extraRollOptions: getExtraRollOptions({ traits, options }),
            skipDialog: true,
        });

        this.setVariable("result", roll?.degreeOfSuccess ?? 2);
        return this.send("out");
    }
}

export { RollSaveTriggerAction };
