import { auraEventSchema } from "schema/event/schema-event-aura";
import { booleanSchemaOuts } from "schema/schema";

const insideAuraSchema = {
    in: true,
    unique: true,
    outs: booleanSchemaOuts,
    inputs: auraEventSchema.inputs,
    variables: [{ key: "aura-source", type: "target" }],
} as const;

export { insideAuraSchema };
