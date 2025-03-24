export {};

declare global {
    type CreateNodeData = WithRequired<NonNullable<NodeRawData>, "type" | "key">;

    type ListedTrigger = { name: string; id: string; enabled: boolean; sub: boolean };

    type VariableData = {
        nodeType: NodeType;
        label: string;
        entryId: NodeEntryId;
        entryType: NonNullable<NodeEntryType>;
        /** variable isn't unique */
        custom: boolean;
        /** variable isn't linked to any node output */
        global?: boolean;
    };

    type BlueprintVariableKey =
        `${string}.${NodeEntryCategory}.${string}.${NonNullable<NodeEntryType>}.${string}`;
}
