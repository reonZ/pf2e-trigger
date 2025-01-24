import { R } from "module-helpers";
import { rollSaveSchema } from "schema/action/schema-roll-save";
import { TriggerNode } from "../trigger-node";

class RollSaveTriggerNode extends TriggerNode<typeof rollSaveSchema> {
    protected async _execute(target: TargetDocuments) {
        const dc = await this.get("dc");
        const save = await this.get("save");
        if (!R.isNumber(dc) || !R.isString(save)) return;

        const rollData = await this.get("roll");
        const originActor = rollData?.origin?.actor ?? this.options.this.actor;

        const statistic = originActor.getStatistic(save);
        if (!statistic) return;

        const roll = await statistic.roll({ dc });
        if (!roll) return;

        await this.send("out", target);
        await this.send("result", target, roll.degreeOfSuccess ?? 2);
    }
}

export { RollSaveTriggerNode };
