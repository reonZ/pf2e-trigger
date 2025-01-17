const eventSchema = {
    isUnique: true,
    outputs: [{ key: "out", label: "target" }],
} as const satisfies EventSchema;

type EventSchema = {
    isUnique: true;
    outputs: [{ key: "out"; label?: string }];
};

export { eventSchema };
export type { EventSchema };
