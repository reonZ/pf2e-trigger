import { extractValueFromDocument } from "helpers/helpers-extract";
import { isInstanceOf } from "module-helpers";
import { TriggerNode } from "../trigger-node";

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
            const type = output.type as DocumentExtractType;
            const path = output.key.replace(/\|/g, ".");
            const value = extractValueFromDocument(document, type, path);

            if (value != null) {
                // @ts-ignore
                this.setVariable(output.key, value);
            }
        }

        // @ts-ignore
        this.send("out");
    }
}

export { DocumentExtractorTriggerSplitter };
