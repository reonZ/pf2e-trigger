import { degreeOfSuccessNumber } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "../node";

class SuccessValueTriggerNode extends TriggerNode<NodeSchemaOf<"value", "success-value">> {
    async query(): Promise<number> {
        const value = await this.get("input");
        return degreeOfSuccessNumber(value) ?? 2;
    }
}

export { SuccessValueTriggerNode };
