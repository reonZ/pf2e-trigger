import { createActionSchema } from "../schema-action";
import { rollDamageSchema } from "../schema-action-roll-damage";
import { rollSaveSchema } from "../schema-action-roll-save";

const toolbeltRollDamageSchema = createActionSchema(
    [
        { key: "save-label", type: "label" },
        ...rollSaveSchema.inputs.filter((x) => x.key !== "roll"),
        { key: "damage-label", type: "label" },
        ...rollDamageSchema.inputs.filter((x) => x.key !== "target"),
    ] as const,
    undefined,
    "pf2e-toolbelt"
);

export { toolbeltRollDamageSchema };
