import { ActorPF2e, ItemPF2e, SaveType, Statistic, getExtraRollOptions } from "module-helpers";
import { rollSaveSchema } from "schema/action/schema-action-roll-save";
import { TriggerNode } from "../trigger-node";

class RollSaveTriggerAction extends TriggerNode<typeof rollSaveSchema> {
    async execute(): Promise<void> {
        const rollData = await this.get("roll");

        if (rollData?.origin === null) {
            return this.send("out");
        }

        const roller = rollData?.origin?.actor ?? this.target.actor;
        const { dcData, isBasic, statistic } = (await getSaveData(this, roller)) ?? {};

        if (!statistic) {
            return this.send("out");
        }

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

async function getSaveData(
    trigger: TriggerNode<typeof rollSaveSchema>,
    roller: ActorPF2e
): Promise<SaveData | null> {
    const save = await trigger.get("save");
    const statistic = roller.getStatistic(save);
    if (!statistic) return null;

    return {
        slug: save as SaveType,
        statistic,
        isBasic: await trigger.get("basic"),
        dcData: (await trigger.get("dc")) ?? { value: 0 },
    };
}

type SaveData = {
    slug: SaveType;
    statistic: Statistic;
    isBasic: boolean;
    dcData: NodeDCEntry;
};

export { RollSaveTriggerAction, getSaveData };
