export {};

declare global {
    type SplitterSchema = {
        in: true;
        outs: ReadonlyArray<NodeSchemaBridge>;
        inputs: Readonly<[NodeSchemaInput]>;
        variables?: ReadonlyArray<NodeSchemaVariable>;
    };

    type ExtractDocumentSchema = {
        in: true;
        outs: Readonly<[{ key: "out" }]>;
        inputs: Readonly<[NodeSchemaInput]>;
    };
}
