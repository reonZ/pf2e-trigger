import { dcValueSchema } from "./schema-value-dc";

const dcTargetSchema = {
    inputs: [
        { key: "target", type: "target" },
        { key: "item", type: "item" },
        { key: "against", type: "text", field: true },
        {
            key: "adjustment",
            type: "number",
            field: {
                min: -10,
                max: 10,
                default: 0,
            },
            connection: true,
        },
    ],
    variables: dcValueSchema.variables,
} as const satisfies ValueSchema;

export { dcTargetSchema };
