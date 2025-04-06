function createActionSchema<TInput extends NodeSchemaInput, TOutput extends NodeSchemaVariable>(
    inputs: TInput[],
    variables?: TOutput[],
    module?: string
): ActionSchema<TInput, TOutput> {
    return {
        in: true,
        outs: [{ key: "out" }],
        inputs: [...inputs, { key: "target", type: "target" }],
        variables,
        module,
    } as const;
}

export { createActionSchema };
