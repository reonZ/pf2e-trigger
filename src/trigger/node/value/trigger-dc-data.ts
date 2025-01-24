import { CheckDC } from "module-helpers";
import { ExtractSchemaOuputsKeys } from "schema/schema";
import { dcDataSchema } from "schema/value/schema-dc-data";
import { TriggerNode } from "../trigger-node";

class DcDataTriggerNode extends TriggerNode<typeof dcDataSchema> {
    #dc: number | null = null;

    protected async _query(key: ExtractSchemaOuputsKeys<typeof dcDataSchema>): Promise<CheckDC> {
        this.#dc ??= await this.get("dc");

        return {
            value: this.#dc,
        };
    }
}

export { DcDataTriggerNode };
