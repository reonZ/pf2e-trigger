import { ExtractSchemaInputsKeys } from "@schema/schema";
import { successValueSchema } from "@schema/value/schema-success-value";
import { TriggerNode } from "../trigger-node";

class SuccessValueTriggerNode extends TriggerNode<typeof successValueSchema> {
    protected async _query(
        key: ExtractSchemaInputsKeys<typeof successValueSchema>
    ): Promise<number> {
        const input = Number(await this.get("input"));
        return isNaN(input) ? 2 : input;
    }
}

export { SuccessValueTriggerNode };
