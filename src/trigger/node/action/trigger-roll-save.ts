import { rollSaveSchema } from "@schema/action/schema-roll-save";
import { TriggerNode } from "../trigger-node";
import { TriggerExecuteOptions } from "@trigger/trigger";
import { R } from "module-helpers";

class RollSaveTriggerNode extends TriggerNode<typeof rollSaveSchema> {
    protected async _execute(origin: TargetDocuments, options: TriggerExecuteOptions) {
        const dc = await this.get("dc", origin, options);
        const save = await this.get("save", origin, options);
        if (!R.isNumber(dc) || !R.isString(save)) return;

        const target = options.target.actor;
        const statistic = target.getStatistic(save);
        if (!statistic) return;

        const roll = await statistic.roll({ dc });
        if (!roll) return;

        this.send("out", origin, options);
        this.send("result", origin, options, roll.degreeOfSuccess ?? 2);
    }
}

export { RollSaveTriggerNode };
