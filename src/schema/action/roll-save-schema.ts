import { ActionSchema } from "./action-schema";

const rollSaveSchema = {
    in: true,
    inputs: [
        {
            key: "dc",
            type: "number",
            field: { min: 0, max: 30, step: 1, default: 15 },
        },
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
    ],
    outputs: [{ key: "out" }, { key: "result", type: "number" }],
} as const satisfies ActionSchema;

export { rollSaveSchema };
