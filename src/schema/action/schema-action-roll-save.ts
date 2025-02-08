import { createActionSchema } from "./schema-action";

const rollSaveSchema = createActionSchema(
    [
        {
            key: "save",
            type: "select",
            field: {
                options: "CONFIG.PF2E.saves",
            },
        },
        { key: "dc", type: "dc" },
        { key: "roll", type: "roll" },
    ] as const,
    [{ key: "result", type: "number" }] as const
);

rollSaveSchema.inputs.pop();

export { rollSaveSchema };
