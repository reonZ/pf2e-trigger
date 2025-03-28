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
        other?: TargetDocuments;
        isHealing?: boolean;
        negated?: boolean;
        list?: string[];
        condition?: { slug: ConditionSlug; update: boolean };
        variables: Record<NodeEntryId, TriggerEntryValue>;
        values?: any;
    };

    type SubtriggerExecuteOptions = TriggerExecuteOptions & {
        parentVariables: Record<string, TriggerEntryValue>;
        send: { out: boolean };
    };
}
