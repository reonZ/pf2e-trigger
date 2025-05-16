import { TriggerData } from "data";
import { makeModuleDocument, MODULE, ModuleDocument } from "module-helpers";
import fields = foundry.data.fields;

const worldTriggerMetada = (): Partial<foundry.abstract.DocumentClassMetadata> => ({
    name: "Triggers",
    collection: "world-triggers",
    indexed: true,
    embedded: { Trigger: "triggers" },
    hasTypeData: true,
    label: "World Triggers",
    schemaVersion: "2.0.0",
});

const worldTriggersSchema = (): WorldTriggersSchema => ({
    triggers: new fields.EmbeddedCollectionField(TriggerData),
});

class WorldTriggers extends makeModuleDocument<null, WorldTriggersSchema>(
    worldTriggerMetada,
    worldTriggersSchema
) {
    protected _initialize(options?: Record<string, unknown>): void {
        super._initialize(options);

        // we initialize node schemas once all the triggers have been initialized and added
        // to make sure they have access to the subtriggers
        for (const trigger of this.triggers) {
            for (const node of trigger.nodes) {
                node._initializeSchema();
            }
        }
    }

    _onDeleteDescendantDocuments(
        parent: ModuleDocument,
        collection: string,
        documents: ModuleDocument[],
        triggerIds: string[],
        options: object
    ): void {
        for (const triggerId of triggerIds) {
            for (const trigger of this.triggers) {
                let removed = false;

                for (const node of trigger.nodes) {
                    if (node.isSubtriggerNode && node.target === triggerId) {
                        node.delete();
                        removed = true;
                    }
                }

                if (removed) {
                    trigger.reset();
                }
            }
        }
    }
}

interface WorldTriggers {
    deleteEmbeddedDocuments(
        embeddedName: "Trigger",
        dataId: string[],
        operation?: Partial<DatabaseDeleteOperation<this>>
    ): Promise<TriggerData[]>;
}

type WorldTriggersSchema = {
    triggers: fields.EmbeddedCollectionField<TriggerData>;
};

MODULE.devExpose({ WorldTriggers });

export { WorldTriggers };
