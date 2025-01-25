import { NodeSchema } from "./schema";

const schemaVariable = {
    inputs: [
        { key: "id", type: "text", field: true },
        { key: "key", type: "text", field: true },
        { key: "type", type: "text", field: true },
    ],
    outputs: [],
} as const satisfies NodeSchema;

export { schemaVariable };
