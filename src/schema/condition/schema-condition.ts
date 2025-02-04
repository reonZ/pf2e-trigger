import { booleanSchemaOuts } from "schema/schema";

function createConditionSchema<TInput extends NodeSchemaInput, TOutput extends NodeSchemaVariable>(
    inputs: TInput[],
    variables?: TOutput[]
): ConditionSchema<TInput, TOutput> {
    return {
        in: true,
        outs: booleanSchemaOuts,
        inputs: [...inputs, { key: "target", type: "target" }],
        variables,
    } as const;
}

export { createConditionSchema };
