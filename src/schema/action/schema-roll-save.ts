import { ActionSchema } from "./schema-action";

const rollSaveSchema = {
    in: true,
    inputs: [
        {
            key: "save",
            type: "select",
            field: {
                options: [
                    { value: "fortitude", label: "PF2E.SavesFortitude" },
                    { value: "reflex", label: "PF2E.SavesReflex" },
                    { value: "will", label: "PF2E.SavesWill" },
                ],
            },
        },
        { key: "dc", type: "dc" },
        { key: "roll", type: "roll" },
    ],
    outputs: [{ key: "out" }, { key: "result", type: "number" }],
} as const satisfies ActionSchema;

export { rollSaveSchema };
