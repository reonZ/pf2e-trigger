import { CheckDC, DurationData, EffectContextData, ItemPF2e } from "module-helpers";
import {
    NODE_ENTRY_CATEGORIES,
    NODE_ENTRY_TYPES,
    NODE_ENTRY_VALUE_TYPE,
    NONNULL_NODE_ENTRY_TYPES,
} from "./data-entry";
import { CUSTOM_TYPES, NODE_TYPES } from "./data-node";

type BaseTriggerData = {
    id: string;
    name: string;
    disabled: boolean;
    variables: TriggerDataVariables;
};

declare global {
    type NodeType = (typeof NODE_TYPES)[number];
    type CustomNodeType = (typeof CUSTOM_TYPES)[number];
    type NodeEntryCategory = (typeof NODE_ENTRY_CATEGORIES)[number];
    type NodeEntryId = `${string}.${NodeEntryCategory}.${string}`;
    type NodeEntryMap = Record<string, NodeDataEntry>;
    type NodeEntryValue = string | number | boolean | undefined;
    type NodeEntryType = (typeof NODE_ENTRY_TYPES)[number] | undefined;
    type NonNullNodeEntryType = (typeof NONNULL_NODE_ENTRY_TYPES)[number];
    type NullNodeEntryType = Exclude<NodeEntryType, NonNullNodeEntryType>;
    type PrimitiveEntryType = Exclude<NonNullNodeEntryType, "select">;

    type TriggerDataVariable = { label: string; type: NonNullable<NodeEntryType> };
    type TriggerDataVariables = Record<NodeEntryId, TriggerDataVariable>;

    type TriggerData = BaseTriggerData & {
        nodes: Record<string, NodeData>;
        event: NodeData;
        aura: NodeData | undefined;
        isSub: boolean;
    };

    type TriggerRawData = Partial<
        BaseTriggerData & {
            nodes: NodeRawData[];
        }
    >;

    type NodeDataCustom = {
        inputs: BaseNodeSchemaInputEntry[];
        outputs: NodeSchemaOutputs;
    };

    type NodeData<T extends NodeType = NodeType> = {
        id: string;
        type: T;
        key: string;
        x: number;
        y: number;
        subId: string | undefined;
        inputs: NodeEntryMap;
        outputs: NodeEntryMap;
        custom: NodeDataCustom;
    };

    type NodeRawData<T extends NodeType = NodeType> = Maybe<Partial<NodeData<T>>>;

    type NodeDataEntry = {
        ids?: NodeEntryId[];
        value?: NodeEntryValue;
    };

    type SegmentedEntryId = {
        nodeId: string;
        category: NodeEntryCategory;
        key: string;
    };

    type TriggerDurationData = DurationData & {
        context?: EffectContextData;
    };

    type ExtractEntryType<T extends NodeEntryType> = T extends NonNullNodeEntryType
        ? PrimitiveOf<(typeof NODE_ENTRY_VALUE_TYPE)[T]>
        : T extends "list"
        ? string[]
        : T extends NullNodeEntryType
        ? ExtractNullEntryType<T> | undefined
        : never;

    type ExtractNullEntryType<T extends NullNodeEntryType> = T extends "item"
        ? ItemPF2e
        : T extends "list"
        ? string[]
        : T extends "target"
        ? TargetDocuments
        : T extends "roll"
        ? RollNodeEntry
        : T extends "dc"
        ? NodeDCEntry
        : T extends "duration"
        ? TriggerDurationData
        : never;

    type NodeDCEntry = CheckDC & {
        target?: TargetDocuments;
    };

    type RollNodeEntry = {
        origin: TargetDocuments | undefined;
        item: ItemPF2e | undefined;
        options: string[];
        traits: string[];
    };

    type NonNullNodeEntry<T> = T & {
        type: NonNullNodeEntryType;
    };

    type CustomNodeEntryType = Exclude<NodeEntryType, "select" | "uuid" | "label" | undefined>;
}
