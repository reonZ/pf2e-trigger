export {};

declare global {
    type ConditionSchema<
        TInput extends NodeSchemaInput = NodeSchemaInput,
        TOutput extends NodeSchemaVariable = NodeSchemaVariable
    > = {
        in: true;
        outs: BooleanSchemaOuts;
        inputs: [...TInput[], { key: "target"; type: "target" }];
        variables?: TOutput[];
    };
}
