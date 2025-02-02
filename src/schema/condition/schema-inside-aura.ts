import { auraEventSchema } from "schema/event/schema-aura-event";
import { BaseConditionSchema } from "./schema-condition";

const insideAuraSchema = {
    in: true,
    unique: true,
    inputs: auraEventSchema.inputs,
    outputs: [...auraEventSchema.outputs, { key: "false" }],
    variables: [{ key: "aura-source", type: "target" }],
} as const satisfies BaseConditionSchema;

export { insideAuraSchema };
