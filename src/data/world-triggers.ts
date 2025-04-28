import { TriggerData, TriggerDataSource } from "data";
import { makeModuleDocument, MODULE } from "module-helpers";
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
) {}

interface WorldTriggers {
    createEmbeddedDocuments(
        embeddedName: "Trigger",
        data: PreCreate<TriggerDataSource>[],
        operation?: Partial<DatabaseCreateOperation<WorldTriggers>>
    ): Promise<TriggerData[]>;
}

type WorldTriggersSchema = {
    triggers: fields.EmbeddedCollectionField<TriggerData>;
};

MODULE.devExpose({ WorldTriggers });

export { WorldTriggers };
