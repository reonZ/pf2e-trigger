import { ZeroToThree, isDegreeOfSuccessNumber } from "module-helpers";
import { successSplitSchema } from "schema/logic/schema-success-split";
import { TriggerExecuteOptions } from "trigger/trigger";
import { TriggerNode } from "../trigger-node";

class SuccessSplitTriggerNode extends TriggerNode<typeof successSplitSchema> {
    protected async _execute(
        origin: TargetDocuments,
        options: TriggerExecuteOptions,
        value?: number
    ) {
        if (!isDegreeOfSuccessNumber(value)) return;
        this.send(String(value) as `${ZeroToThree}`, origin, options);
    }
}

export { SuccessSplitTriggerNode };
