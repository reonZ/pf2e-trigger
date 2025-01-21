import {
    BooleanSchemaOutputs,
    BridgeNodeEntry,
    NodeSchemaInputEntry,
    createBooleanSchemaOutputs,
} from "schema/schema";

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

type ConditionSchema<TInputs extends NodeSchemaInputEntry> = Omit<
    BaseConditionSchema<TInputs>,
    "outputs"
> & {
    outputs: BooleanSchemaOutputs;
};

type BaseConditionSchema<TInputs extends NodeSchemaInputEntry = NodeSchemaInputEntry> = {
    in: true;
    isUnique?: boolean;
    inputs: TInputs[];
    outputs: BridgeNodeEntry[];
};

export { createConditionSchema };
export type { BaseConditionSchema };
