import { isInstanceOf } from "module-helpers";
import { TriggerNode } from "../trigger-node";
import { NODE_ENTRY_VALUE_TYPE } from "data/data-entry";

abstract class DocumentExtractorTriggerSplitter<
    TSchema extends ExtractDocumentSchema
> extends TriggerNode<TSchema> {
    abstract getDocument(): Promise<Maybe<ClientDocument>>;

    async execute(): Promise<void> {
        const document = await this.getDocument();

        if (!isInstanceOf(document, "ClientDocumentMixin")) {
            // @ts-ignore
            return this.send("out");
        }

        const outputs = this.custom.outputs as NodeSchemaVariable[];

        for (const output of outputs) {
            const type = output.type as "boolean" | "number" | "text";
            const path = output.key.replace(/\|/g, ".");
            const cursor = fu.getProperty(document, path);

            if (cursor.constructor === NODE_ENTRY_VALUE_TYPE[type]) {
                // @ts-ignore
                this.setVariable(output.key, cursor);
            }
        }

        // @ts-ignore
        this.send("out");
    }
}

export { DocumentExtractorTriggerSplitter };
