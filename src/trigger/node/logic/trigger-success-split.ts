import { ZeroToThree, isDegreeOfSuccessNumber } from "module-helpers";
import { successSplitSchema } from "schema/logic/schema-success-split";
import { TriggerNode } from "../trigger-node";

class SuccessSplitTriggerNode extends TriggerNode<typeof successSplitSchema> {
    protected async _execute(target: TargetDocuments, value?: number) {
        if (!isDegreeOfSuccessNumber(value)) return;
        return this.send(String(value) as `${ZeroToThree}`, target);
    }
}

export { SuccessSplitTriggerNode };
