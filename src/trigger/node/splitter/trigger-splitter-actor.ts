import { actorSplitterSchema } from "schema/splitter/schema-splitter-actor";
import { DocumentExtractorTriggerSplitter } from "./trigger-splitter-extract-document";

class ActorTriggerSplitter extends DocumentExtractorTriggerSplitter<typeof actorSplitterSchema> {
    async getDocument(): Promise<ClientDocument> {
        return ((await this.get("target")) ?? this.target).actor;
    }
}

export { ActorTriggerSplitter };
