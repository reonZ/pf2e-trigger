import { dcValueSchema } from "schema/value/schema-value-dc";
import { TriggerNode } from "../trigger-node";

class DcTriggerValue extends TriggerNode<typeof dcValueSchema> {
    #dc: number | undefined;

    async query(key: "dc"): Promise<TriggerEntryValue> {
        return (this.#dc ??= await this.get("dc"));
    }
}

export { DcTriggerValue };
