import { booleanSchemaOuts } from "schema/schema";

const booleanSplitterSchema = {
    in: true,
    outs: booleanSchemaOuts,
    inputs: [
        {
            key: "boolean",
            type: "boolean",
            field: false,
        },
    ],
} as const satisfies SplitterSchema;

export { booleanSplitterSchema };
