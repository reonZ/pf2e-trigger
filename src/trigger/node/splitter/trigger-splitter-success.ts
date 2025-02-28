import { successSplitterSchema } from "schema/splitter/schema-splitter-success";
import { TriggerNode } from "../trigger-node";
import { ZeroToThree, isDegreeOfSuccessNumber } from "module-helpers";

class SuccessTriggerSplitter extends TriggerNode<typeof successSplitterSchema> {
    async execute(): Promise<void> {
        const result = await this.get("result");
        const value = isDegreeOfSuccessNumber(result) ? result : 2;

        return this.send(String(value) as `${ZeroToThree}`);
    }
}

export { SuccessTriggerSplitter };
