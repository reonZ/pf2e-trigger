import { itemConverterSchema } from "schema/converter/schema-converter-item";
import { TriggerNode } from "../trigger-node";

class ItemTriggerConverter extends TriggerNode<typeof itemConverterSchema> {
    async query(key: string): Promise<string | undefined> {
        const item = await this.get("item");
        return item?.uuid;
    }
}

export { ItemTriggerConverter };
