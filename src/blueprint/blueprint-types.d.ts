export {};

declare global {
    type CreateNodeData = WithRequired<NonNullable<NodeRawData>, "type" | "key">;

    type ListedTrigger = { name: string; id: string; enabled: boolean; sub: boolean };

    type VariableData = {
        type: NodeType;
        key: BlueprintVariableKey;
        label: string;
        custom: boolean;
        entryId: NodeEntryId;
        entryType: NonNullable<NodeEntryType>;
    };

    type BlueprintVariableKey =
        `${string}.${NodeEntryCategory}.${string}.${NonNullable<NodeEntryType>}.${string}`;
}
