import {
    BooleanSchemaOutputs,
    NodeSchema,
    NodeSchemaInputEntry,
    createBooleanSchemaOutputs,
} from "@schema/schema";

function createConditionSchema({
    inputs,
    isUnique,
}: {
    inputs?: NodeSchemaInputEntry[];
    isUnique?: boolean;
} = {}): ConditionSchema {
    return {
        in: true,
        isUnique: isUnique,
        inputs: inputs,
        outputs: createBooleanSchemaOutputs(),
    };
}

type ConditionSchema = Omit<NodeSchema, "in" | "outputs"> & {
    in: true;
    outputs: BooleanSchemaOutputs;
};

export type { ConditionSchema };
export { createConditionSchema };
