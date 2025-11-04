import { getExtraRollOptions } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class RollSaveTriggerNode extends TriggerNode<NodeSchemaOf<"action", "roll-save">> {
    async execute(): Promise<boolean> {
        const save = await this.get("save");
        const roll = await this.get("roll");
        const roller = (roll.origin ?? this.target).actor;
        const statistic = roller.getStatistic(save);

        if (!statistic) {
            return this.send("out");
        }

        const dc = await this.get("dc");
        const isBasic = await this.get("basic");
        const isPrivate = await this.get("private");

        const rolled = await statistic.roll({
            dc,
            origin: dc.target?.actor,
            item: roll.item,
            extraRollOptions: getExtraRollOptions(roll, isBasic),
            rollMode: isPrivate ? "blindroll" : "publicroll",
            skipDialog: true,
            extraRollNotes: roll.notes,
        });

        this.setVariable("result", rolled?.degreeOfSuccess ?? 0);
        return this.send("out");
    }
}

export { RollSaveTriggerNode };
