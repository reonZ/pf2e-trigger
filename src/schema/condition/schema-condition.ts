import {
    BooleanSchemaOutputs,
    BridgeNodeEntry,
    NodeSchemaInputEntry,
    NodeSchemaVariable,
    createBooleanSchemaOutputs,
} from "schema/schema";

function createConditionSchema<TInputs extends NodeSchemaInputEntry>(
    inputs: TInputs[],
    unique?: boolean
): ConditionSchema<TInputs> {
    return {
        in: true,
        unique,
        inputs,
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
    unique?: boolean;
    inputs: TInputs[];
    outputs: BridgeNodeEntry[];
    variables?: NodeSchemaVariable[];
};

export { createConditionSchema };
export type { BaseConditionSchema };
