import { dcValueSchema } from "schema/value/schema-value-dc";
import { TriggerNode } from "../trigger-node";

class DcTriggerValue extends TriggerNode<typeof dcValueSchema> {
    #dc: number | undefined;

    async query(key: "dc"): Promise<NodeDCEntry> {
        const dc = (this.#dc ??= await this.get("dc"));
        return { value: dc };
    }
}

export { DcTriggerValue };
