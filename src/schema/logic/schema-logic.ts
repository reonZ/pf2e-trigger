import { booleanSchemaOuts } from "schema/schema";

function createLogicSchema<T extends NonNullable<NodeEntryType>>(type: T) {
    return {
        in: true,
        outs: booleanSchemaOuts,
        inputs: [
            { key: "a", type, field: true },
            { key: "b", type, field: true },
        ],
    } as const;
}

export { createLogicSchema };
