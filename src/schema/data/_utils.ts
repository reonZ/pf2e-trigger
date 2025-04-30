function booleanOutsSchema() {
    return [{ key: "true" }, { key: "false" }] as const;
}

type BooleanOutsSchema = ReturnType<typeof booleanOutsSchema>

export { booleanOutsSchema };
export type {BooleanOutsSchema}