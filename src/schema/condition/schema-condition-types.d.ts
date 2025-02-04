export {};

declare global {
    type ConditionSchema<TInput extends NodeSchemaInput, TOutput extends NodeSchemaVariable> = {
        in: true;
        outs: BooleanSchemaOuts;
        inputs: [...TInput[], { key: "target"; type: "target" }];
        variables?: TOutput[];
    };
}
