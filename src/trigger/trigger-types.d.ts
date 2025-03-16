import { AuraData, ConditionSlug, ItemPF2e } from "module-helpers";

declare global {
    type ActorAura = {
        data: AuraData;
        origin: AuraOrigin;
    };

    type AuraOrigin = Required<TargetDocuments>;

    type PreTriggerExecuteOptions = Omit<TriggerExecuteOptions, "variables"> & {
        variables?: Record<string, TriggerEntryValue>;
    };

    type PreTriggerExecuteOptionsWithVariables = Omit<TriggerExecuteOptions, "variables"> & {
        variables: Record<string, TriggerEntryValue>;
    };

    type TriggerExecuteOptions = {
        this: TargetDocuments;
        aura?: ActorAura;
        item?: ItemPF2e;
        condition?: { slug: ConditionSlug; update: boolean };
        values?: any;
        variables: Record<NodeEntryId, TriggerEntryValue>;
    };

    type SubtriggerExecuteOptions = TriggerExecuteOptions & {
        parentVariables: Record<string, TriggerEntryValue>;
        send: { out: boolean };
    };
}
