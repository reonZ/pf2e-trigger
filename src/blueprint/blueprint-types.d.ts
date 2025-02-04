export {};

declare global {
    type CreateNodeData = WithRequired<NonNullable<NodeRawData>, "type" | "key">;
}
