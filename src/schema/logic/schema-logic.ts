import { BooleanSchemaOutputs, NodeEntryType, createBooleanSchemaOutputs } from "schema/schema";

function createLogicSchema<T extends NonNullable<NodeEntryType>>(type: T): LogicSchema<T> {
    return {
        inputs: [
            { key: "a", type },
            { key: "b", type },
        ],
        outputs: createBooleanSchemaOutputs(),
    };
}

type LogicSchema<T extends NonNullable<NodeEntryType> = NonNullable<NodeEntryType>> = {
    inputs: [{ key: "a"; type: T }, { key: "b"; type: T }];
    outputs: BooleanSchemaOutputs;
};

type SplitLogicSchema<T extends NonNullable<NodeEntryType> = NonNullable<NodeEntryType>> = {
    inputs: [{ key: "input"; type: T }];
    outputs: { key: string; label?: string }[];
};

export { createLogicSchema };
export type { LogicSchema, SplitLogicSchema };
