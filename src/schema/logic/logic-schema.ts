import {
    BooleanSchemaOutputs,
    ExtractInputSchemaEntry,
    NodeSchemaInputEntry,
    NonNullableNodeEntryType,
    createBooleanSchemaOutputs,
} from "@schema/schema";

function createLogicSchema<T extends NonNullableNodeEntryType>(
    type: T
): LogicSchema<ExtractInputSchemaEntry<T>> {
    return {
        inputs: [
            { key: "a", type },
            { key: "b", type },
        ] as [ExtractInputSchemaEntry<T>, ExtractInputSchemaEntry<T>],
        outputs: createBooleanSchemaOutputs(),
    };
}

type LogicSchema<T extends NodeSchemaInputEntry = NodeSchemaInputEntry> = {
    inputs: [T, T];
    outputs: BooleanSchemaOutputs;
};

export type { LogicSchema };
export { createLogicSchema };
