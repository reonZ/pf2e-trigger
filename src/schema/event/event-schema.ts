import { NodeSchema } from "@schema/schema";

const eventSchema = {
    isUnique: true,
    outputs: [{ key: "out", label: "target" }],
} as const satisfies NodeSchema;

export { eventSchema };
