import { createAction } from "./schema-action";

const rollSaveSchema = createAction(
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
