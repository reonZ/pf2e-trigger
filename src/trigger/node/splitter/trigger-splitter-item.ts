import { itemSplitterSchema } from "schema/splitter/schema-splitter-item";
import { DocumentExtractorTriggerSplitter } from "./trigger-splitter-extract-document";

class ItemTriggerSplitter extends DocumentExtractorTriggerSplitter<typeof itemSplitterSchema> {
    async getDocument(): Promise<Maybe<ClientDocument>> {
        return this.get("item");
    }
}

export { ItemTriggerSplitter };
