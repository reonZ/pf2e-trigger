export {};

declare global {
    type CreateNodeData = WithRequired<NonNullable<NodeRawData>, "type" | "key">;

    type ListedTrigger = { name: string; id: string; enabled: boolean; sub: boolean };
}
