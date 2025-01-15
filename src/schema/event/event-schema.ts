import { NodeSchemaOutputEntry } from "@schema/schema";

const eventSchema = {
    isUnique: true,
    outputs: [{ key: "out", label: "target" }],
} as const satisfies EventSchema;

type EventSchema = {
    isUnique: true;
    outputs: Omit<NodeSchemaOutputEntry, "type">[];
};

export { eventSchema };
export type { EventSchema };
