import { booleanSchemaOuts } from "schema/schema";

function createLogicSchema<T extends NodeEntryType>(type: T, field: boolean = true): NodeRawSchema {
    return {
        in: true,
        outs: booleanSchemaOuts,
        inputs: [
            { key: "a", type, field },
            { key: "b", type, field },
        ],
    } as NodeRawSchema;
}

export { createLogicSchema };
