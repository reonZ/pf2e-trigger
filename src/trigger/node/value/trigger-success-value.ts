import { successValueSchema } from "@schema/value/schema-success-value";
import { ValueTriggerNode } from "./trigger-node-value";
import { TriggerExecuteOptions } from "@trigger/trigger";

class SuccessValueTriggerNode extends ValueTriggerNode<typeof successValueSchema> {
    protected async _computeValue(
        origin: TargetDocuments,
        options: TriggerExecuteOptions
    ): Promise<number> {
        const input = Number(await this.get("input", origin, options));
        return isNaN(input) ? 2 : input;
    }
}

export { SuccessValueTriggerNode };
