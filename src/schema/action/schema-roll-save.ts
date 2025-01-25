import { ActionSchema } from "./schema-action";

const rollSaveSchema = {
    in: true,
    inputs: [
        {
            key: "save",
            type: "select",
            field: {
                options: "CONFIG.PF2E.saves",
            },
        },
        { key: "dc", type: "dc" },
        { key: "roll", type: "roll" },
    ],
    outputs: [{ key: "out" }, { key: "result", type: "number" }],
} as const satisfies ActionSchema;

export { rollSaveSchema };
