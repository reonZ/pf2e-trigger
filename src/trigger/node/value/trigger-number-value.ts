import { ExtractSchemaOuputsKeys } from "schema/schema";
import { TypeValueSchema } from "schema/value/schema-value";
import { TriggerNode } from "../trigger-node";

class NumberValueTriggerNode extends TriggerNode<TypeValueSchema<"number">> {
    #cached: number | undefined;

    protected async _query(
        key: ExtractSchemaOuputsKeys<TypeValueSchema<"number">>
    ): Promise<number> {
        return (this.#cached ??= (await this.get("input")) || 0);
    }
}

export { NumberValueTriggerNode };
