const eventSchema = {
    unique: true,
    outputs: [{ key: "out", label: "target" }],
} as const satisfies EventSchema;

type EventSchema = {
    unique: true;
    outputs: [{ key: "out"; label?: string }];
};

export { eventSchema };
export type { EventSchema };
