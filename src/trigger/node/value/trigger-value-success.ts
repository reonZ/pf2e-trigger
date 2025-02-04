import { successValueSchema } from "schema/value/schema-value-success";
import { TriggerNode } from "../trigger-node";
import { ZeroToThree, isDegreeOfSuccessNumber } from "module-helpers";

class SuccessTriggerValue extends TriggerNode<typeof successValueSchema> {
    async query(key: "value"): Promise<ZeroToThree> {
        const input = Number(await this.get("input"));
        return isDegreeOfSuccessNumber(input) ? input : 2;
    }
}

export { SuccessTriggerValue };
