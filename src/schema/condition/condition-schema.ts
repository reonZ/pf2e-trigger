import {
    BooleanSchemaOutputs,
    NodeSchemaInputEntry,
    createBooleanSchemaOutputs,
} from "@schema/schema";

function createConditionSchema<TInputs extends NodeSchemaInputEntry>(
    inputs: TInputs[],
    isUnique?: boolean
): ConditionSchema<TInputs> {
    return {
        in: true,
        isUnique: isUnique,
        inputs: inputs,
        outputs: createBooleanSchemaOutputs(),
    };
}

type ConditionSchema<TInputs extends NodeSchemaInputEntry> = {
    in: true;
    isUnique?: boolean;
    inputs: TInputs[];
    outputs: BooleanSchemaOutputs;
};

export { createConditionSchema };
export type { ConditionSchema };
