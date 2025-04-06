export {};

declare global {
    type ActionSchema<TInput extends NodeSchemaInput, TOutput extends NodeSchemaVariable> = {
        in: true;
        outs: [{ key: "out" }];
        inputs: [...TInput[], { key: "target"; type: "target" }];
        variables?: TOutput[];
        module?: string;
    };
}
