function schemaBooleanOuts() {
    return [{ key: "true" }, { key: "false" }] as const;
}

function schemaConditionEntries(type: "add" | "reduce") {
    const option = type === "add" ? "addConditionTypes" : "reduceConditionTypes";
    return [
        {
            key: "condition",
            type: "select",
            field: {
                options: `CONFIG.Pf2eTrigger.${option}`,
            },
        },
        {
            key: "counter",
            type: "number",
            label: "PF2E.Item.Effect.Badge.Type.counter",
            field: {
                default: 1,
                min: 1,
            },
        },
    ] as const;
}

function schemaUnidentifiedEntry(enabled: boolean = false) {
    return [
        {
            key: "unidentified",
            type: "boolean",
            label: "PF2E.Item.Effect.Unidentified",
            field: {
                default: enabled,
            },
        },
    ] as const;
}

type SchemaBooleanOuts = ReturnType<typeof schemaBooleanOuts>;

export { schemaBooleanOuts, schemaConditionEntries, schemaUnidentifiedEntry };
export type { SchemaBooleanOuts };
