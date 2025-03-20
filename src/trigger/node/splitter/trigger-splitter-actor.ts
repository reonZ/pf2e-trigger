import { actorSplitterSchema } from "schema/splitter/schema-splitter-actor";
import { DocumentExtractorTriggerSplitter } from "./trigger-splitter-extract-document";

class ActorTriggerSplitter extends DocumentExtractorTriggerSplitter<typeof actorSplitterSchema> {
    async getDocument(): Promise<Maybe<ClientDocument>> {
        return this.getTargetActor("target");
    }
}

export { ActorTriggerSplitter };
