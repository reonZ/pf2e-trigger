import { TriggerData } from "data";
import { KeyedRecordField, makeModuleDocument, MODULE, ModuleDocument, R } from "module-helpers";
import fields = foundry.data.fields;

const triggersContextMetada = (): Partial<foundry.abstract.DocumentClassMetadata> => ({
    name: "Triggers",
    collection: "world-triggers",
    indexed: true,
    embedded: { Trigger: "triggers" },
    hasTypeData: true,
    label: "World Triggers",
    schemaVersion: "2.0.0",
});

const triggersContextSchema = (): TriggersContextSchema => ({
    disabled: keyedIdBoolean(),
    enabled: new KeyedRecordField(
        new fields.StringField({
            required: true,
            nullable: false,
        }),
        keyedIdBoolean(),
        {
            required: false,
            nullable: false,
            initial: {},
        }
    ),
    module: new fields.StringField({
        required: false,
        nullable: false,
        blank: false,
        initial: undefined,
    }),
    triggers: new fields.EmbeddedCollectionField(TriggerData),
});

class TriggersContext extends makeModuleDocument<null, TriggersContextSchema>(
    triggersContextMetada,
    triggersContextSchema
) {
    declare subtriggers: Collection<TriggerData>;

    isEnabled(trigger: TriggerData): boolean {
        return trigger.module
            ? !!this.enabled[trigger.module]?.[trigger.id]
            : !this.disabled[trigger.id];
    }

    protected _initialize(options?: Record<string, unknown>): void {
        super._initialize(options);

        this.subtriggers = new Collection(
            R.pipe(
                this.triggers.contents,
                R.filter((trigger) => trigger.isSubtrigger),
                R.map((trigger) => [trigger.id, trigger] as const)
            )
        );

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

function keyedIdBoolean(): KeyedRecordField<
    fields.DocumentIdField<string, true, false, false>,
    fields.BooleanField<true, true>,
    false
> {
    return new KeyedRecordField(
        new fields.DocumentIdField<string, true, false, false>({
            required: true,
            nullable: false,
        }),
        new fields.BooleanField({
            nullable: false,
            initial: true,
            choices: [true],
        }),
        {
            required: false,
            nullable: false,
            initial: {},
        }
    );
}

interface TriggersContext {
    deleteEmbeddedDocuments(
        embeddedName: "Trigger",
        dataId: string[],
        operation?: Partial<DatabaseDeleteOperation<this>>
    ): Promise<TriggerData[]>;
}

type TriggersContextSchema = {
    disabled: KeyedRecordField<
        fields.DocumentIdField<string, true, false, false>,
        fields.BooleanField<true, true>,
        false
    >;
    enabled: KeyedRecordField<
        fields.StringField<string, string, true, false, false>,
        KeyedRecordField<
            fields.DocumentIdField<string, true, false, false>,
            fields.BooleanField<true, true>,
            false
        >,
        false
    >;
    module: fields.StringField<string, string, false, false, false>;
    triggers: fields.EmbeddedCollectionField<TriggerData>;
};

MODULE.devExpose({ TriggersContext });

export { TriggersContext };
