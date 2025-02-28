export {};

declare global {
    type SplitterSchema = {
        in: true;
        outs: ReadonlyArray<NodeSchemaBridge>;
        inputs: [NodeSchemaInput];
        variables?: ReadonlyArray<NodeSchemaVariable>;
    };
}
