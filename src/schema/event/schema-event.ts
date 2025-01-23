const eventSchema = {
    unique: true,
    outputs: [{ key: "out" }],
    variables: [{ key: "this", type: "target" }],
} as const satisfies EventSchema;

type EventSchema = {
    unique: true;
    outputs: [{ key: "out"; label?: string }];
    variables: [{ key: "this"; type: "target" }];
};

export { eventSchema };
export type { EventSchema };
