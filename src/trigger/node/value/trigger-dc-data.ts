import { DcNodeEntry, ExtractSchemaOuputsKeys } from "schema/schema";
import { dcTargetSchema, dcValueSchema } from "schema/value/schema-dc-data";
import { TriggerNode } from "../trigger-node";

class DcValueTriggerNode extends TriggerNode<typeof dcValueSchema> {
    #dc: number | null = null;

    protected async _query(
        key: ExtractSchemaOuputsKeys<typeof dcValueSchema>
    ): Promise<DcNodeEntry> {
        this.#dc ??= await this.get("dc");

        return {
            value: this.#dc,
        };
    }
}

class DcTargetTriggerNode extends TriggerNode<typeof dcTargetSchema> {
    protected async _query(
        key: ExtractSchemaOuputsKeys<typeof dcValueSchema>
    ): Promise<DcNodeEntry> {
        return {
            target: await this.get("target"),
            against: await this.get("against"),
            adjustment: await this.get("adjustment"),
        };
    }
}

export { DcTargetTriggerNode, DcValueTriggerNode };
