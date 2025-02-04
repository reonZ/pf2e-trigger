import { booleanSchemaOuts } from "schema/schema";

function createLogicSchema<T extends NonNullable<NodeEntryType>>(type: T) {
    return {
        in: true,
        outs: booleanSchemaOuts,
        inputs: [
            { key: "a", type },
            { key: "b", type },
        ],
    } as const;
}

export { createLogicSchema };
