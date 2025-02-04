function createValueSchema<T extends PrimitiveEntryType>(type: T) {
    return {
        inputs: [{ key: "input", type }],
        variables: [{ key: "value", type }],
    } as const;
}

export { createValueSchema };
