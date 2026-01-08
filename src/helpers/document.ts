import { R } from "module-helpers";
import fields = foundry.data.fields;
import abstract = foundry.abstract;

function makeModuleDocument<
    TParent extends (abstract.Document & ModuleDocument) | null,
    TSchema extends fields.DataSchema,
>(
    metadata: () => Partial<abstract.DocumentClassMetadata>,
    schema: () => TSchema,
): ConstructorOf<ModuleDocument<TParent, TSchema> & ModelPropsFromSchema<TSchema>> {
    return class extends abstract.Document<TParent, TSchema> {
        static metadata = Object.freeze(foundry.utils.mergeObject(super.metadata, metadata(), { inplace: false }));

        static defineSchema(): TSchema {
            return schema();
        }

        static async createDocuments<TDocument extends abstract.Document>(
            this: ConstructorOf<TDocument> & typeof abstract.Document,
            data: (TDocument | PreCreate<TDocument["_source"]>)[] = [],
            operation: Partial<DatabaseCreateOperation<TDocument["parent"]>> = {},
        ): Promise<TDocument[]> {
            const documents: TDocument[] = [];
            const parent = operation.parent as Maybe<ModuleDocument>;
            const collection = parent?.getEmbeddedCollection(this.collectionName);

            for (const source of R.isArray(data) ? data : [data]) {
                const document = this.fromSource(source, { parent }) as TDocument;

                documents.push(document);
                collection?.set(document.id, document as any, { modifySource: true });
            }

            if (collection && operation.broadcast !== false) {
                parent?._dispatchDescendantDocumentEvents("onCreate", collection.name, [documents, data, operation]);
            }

            return documents;
        }

        static async updateDocuments<TDocument extends abstract.Document>(
            this: ConstructorOf<TDocument> & typeof abstract.Document,
            updates: Record<string, unknown>[] = [],
            operation: Partial<DatabaseUpdateOperation<TDocument["parent"]>> = {},
        ): Promise<TDocument[]> {
            const documents: TDocument[] = [];
            const changes: Record<string, unknown>[] = [];
            const parent = operation.parent as Maybe<ModuleDocument>;
            const collection = parent?.getEmbeddedCollection(this.collectionName);

            if (!collection) {
                return documents;
            }

            for (const update of updates) {
                if (!R.isString(update._id)) continue;

                const document = collection.get(update._id, { strict: false }) as TDocument;
                if (!document) continue;

                const changed = document.updateSource(update);

                changes.push(changed);
                documents.push(document);
            }

            if (operation.broadcast !== false) {
                parent?._dispatchDescendantDocumentEvents("onUpdate", collection.name, [documents, changes, operation]);
            }

            return documents;
        }

        static async deleteDocuments<TDocument extends abstract.Document>(
            this: ConstructorOf<TDocument> & typeof abstract.Document,
            ids: string[] = [],
            operation: Partial<DatabaseDeleteOperation<TDocument["parent"]>> = {},
        ): Promise<TDocument[]> {
            const documents: TDocument[] = [];
            const deleted: string[] = [];
            const parent = operation.parent as Maybe<ModuleDocument>;
            const collection = parent?.getEmbeddedCollection(this.collectionName);

            if (!collection) {
                return documents;
            }

            for (const id of ids) {
                const document = collection.get(id, { strict: false }) as TDocument;
                if (!document) continue;

                if (collection.delete(id, { modifySource: true })) {
                    deleted.push(id);
                    documents.push(document);
                }
            }

            if (operation.broadcast !== false) {
                for (const document of documents) {
                    document["_onDelete"](operation as DatabaseDeleteOperation<TDocument["parent"]>, game.user.id);
                }

                parent?._dispatchDescendantDocumentEvents("onDelete", collection.name, [documents, deleted, operation]);
            }

            return documents;
        }

        _onCreateDescendantDocuments(parent: ModuleDocument, collection: string, ...args: any[]) {}
        _onUpdateDescendantDocuments(parent: ModuleDocument, collection: string, ...args: any[]) {}
        _onDeleteDescendantDocuments(parent: ModuleDocument, collection: string, ...args: any[]) {}

        /**
         * client/documents/abstract/client-document.mjs#590
         */
        _dispatchDescendantDocumentEvents(
            event: DispatchEvent,
            collection: string,
            args: any[],
            _parent?: ModuleDocument,
        ) {
            _parent ||= this;

            // Dispatch the event to this Document
            const fn = this[`_${event}DescendantDocuments`];
            if (!(fn instanceof Function)) throw new Error(`Invalid descendant document event "${event}"`);
            fn.call(this, _parent, collection, ...args);

            // Bubble the event to the parent Document
            const parent = this.parent;
            if (!parent) return;
            parent._dispatchDescendantDocumentEvents(event, collection, args, _parent);
        }
    } as ConstructorOf<ModuleDocument<TParent, TSchema> & ModelPropsFromSchema<TSchema>>;
}

interface ModuleDocument<
    TParent extends abstract.Document | null = abstract._Document | null,
    TSchema extends fields.DataSchema = fields.DataSchema,
> extends abstract.Document<TParent, TSchema> {
    _onCreateDescendantDocuments(
        parent: ModuleDocument,
        collection: string,
        documents: ModuleDocument[],
        data: object[],
        options: object,
    ): void;

    _onUpdateDescendantDocuments(
        parent: ModuleDocument,
        collection: string,
        documents: ModuleDocument[],
        changes: object[],
        options: object,
    ): void;

    _onDeleteDescendantDocuments(
        parent: ModuleDocument,
        collection: string,
        documents: ModuleDocument[],
        ids: string[],
        options: object,
    ): void;

    _dispatchDescendantDocumentEvents(
        event: DispatchEvent,
        collection: string,
        args: any[],
        _parent?: ModuleDocument,
    ): void;
}

type DispatchEvent = "onCreate" | "onUpdate" | "onDelete";

export { makeModuleDocument };
export type { ModuleDocument };
