import { R, localize, roundToStep } from "module-helpers";
import { getSchema } from "schema/schema-list";

const NODE_ENTRY_CATEGORIES = ["inputs", "outputs"] as const;

const NONNULL_NODE_ENTRY_TYPES = ["text", "number", "select", "boolean", "uuid"] as const;

const NODE_ENTRY_TYPES = [
    ...NONNULL_NODE_ENTRY_TYPES,
    "target",
    "item",
    "roll",
    "dc",
    "duration",
    "label",
] as const;

const NODE_ENTRY_VALUE_TYPE = {
    boolean: Boolean,
    number: Number,
    select: String,
    text: String,
    uuid: String,
} as const satisfies Record<
    NonNullNodeEntryType,
    StringConstructor | NumberConstructor | BooleanConstructor
>;

const NODE_ENTRY_CONVERTABLE_TYPE: Partial<Record<NonNullable<NodeEntryType>, NodeEntryType[]>> = {
    item: ["uuid"],
    uuid: ["item"],
};

function processDataInputs(data: NonNullable<NodeRawData>): NodeEntryMap {
    if (!R.isPlainObject(data.inputs)) {
        return {};
    }

    const schemaInputs = getSchema(data as NodeData)?.inputs as NodeSchemaInputs | undefined;
    if (!schemaInputs) {
        return {};
    }

    const processed: NodeEntryMap = {};

    for (const [key, entry] of R.entries(data.inputs)) {
        if (key === "in") {
            const ids = processEntryIds(entry?.ids);
            if (ids.length) {
                processed[key] = { ids };
            }
            continue;
        }

        const schema = schemaInputs.find((x) => x.key === key);

        if (R.isArray(entry?.ids)) {
            const ids = processEntryIds(entry?.ids);

            if (ids.length) {
                processed[key] = { ids };
            }
        } else if (schema && "type" in schema && isNonNullNodeEntry(schema)) {
            processed[key] = {
                value: isEntryValue(schema, entry?.value)
                    ? entry.value
                    : getDefaultInputValue(schema),
            };
        }
    }

    return processed;
}

function processDataOutputs(data: NonNullable<NodeRawData>): NodeEntryMap {
    const processed: NodeEntryMap = {};

    if (!R.isPlainObject(data.outputs)) {
        return processed;
    }

    for (const [key, entry] of R.entries(data.outputs)) {
        const ids = processEntryIds(entry?.ids);

        if (ids.length) {
            processed[key] = { ids };
        }
    }

    return processed;
}

function processEntryIds(ids: unknown): NodeEntryId[] {
    return R.isArray(ids) ? R.filter(ids, (id): id is NodeEntryId => isEntryId(id)) : [];
}

function getNodeEntryValueList(): SelectOptions<CustomNodeEntryType> {
    return R.pipe(
        NODE_ENTRY_TYPES,
        R.filter(
            (value): value is CustomNodeEntryType => !["select", "uuid", "label"].includes(value)
        ),
        R.map((value) => {
            return {
                value,
                label: localize("node.entry", value),
            };
        }),
        R.sortBy(R.prop("label"))
    );
}

function isEntryId(id: unknown): id is NodeEntryId {
    if (!R.isString(id)) return false;

    const seg = id.split(".");
    return seg.length === 3 && isEntryCategory(seg[1]);
}

function isEntryCategory(category: any): category is NodeEntryCategory {
    return R.isString(category) && NODE_ENTRY_CATEGORIES.includes(category as NodeEntryCategory);
}

function isEntryValue(schema: NodeSchemaInput, value: unknown): value is string | number | boolean {
    if (
        !isNonNullNodeEntryType(schema.type) ||
        R.isNullish(value) ||
        value?.constructor !== NODE_ENTRY_VALUE_TYPE[schema.type]
    ) {
        return false;
    }

    switch (schema.type) {
        case "number": {
            if (isNaN(value)) return false;
            if (!R.isPlainObject(schema.field)) return true;

            return (
                value >= (schema.field.min ?? -Infinity) && value <= (schema.field.max ?? Infinity)
            );
        }

        case "select": {
            return !!getSelectOption(schema.field, value);
        }
    }

    return true;
}

function getSelectOptions(field: NodeSchemaSelectField): (string | NodeSchemaSelectOption)[] {
    return R.isArray(field.options)
        ? field.options
        : R.pipe(
              fu.getProperty(window, field.options) as Record<string, string>,
              R.entries(),
              R.map(([value, label]) => ({ value, label }))
          );
}

function getSelectOption(
    field: NodeSchemaSelectField,
    value: string
): string | NodeSchemaSelectOption | undefined {
    const trimmed = value.trim();
    const options = getSelectOptions(field);

    return options.find((option) =>
        R.isString(option) ? trimmed === option : option.value === trimmed
    );
}

function getDefaultInputValue(
    schema: NonNullNodeEntry<NodeSchemaInput>
): NonNullable<NodeEntryValue> {
    if (typeof schema.field === "object" && "default" in schema.field && schema.field.default) {
        return schema.field.default;
    }

    if (schema.type === "select") {
        const [option] = getSelectOptions(schema.field);
        return R.isPlainObject(option) ? option.value : option;
    }

    return new NODE_ENTRY_VALUE_TYPE[schema.type]().valueOf();
}

function setToSchemaValue(
    schema: NonNullNodeEntry<NodeSchemaInput>,
    value: unknown
): NodeEntryValue {
    if (R.isNullish(value)) {
        return getDefaultInputValue(schema);
    }

    const cast = NODE_ENTRY_VALUE_TYPE[schema.type](value).valueOf() as any;

    switch (schema.type) {
        case "number": {
            if (isNaN(cast)) {
                return getDefaultInputValue(schema);
            }

            if (!R.isPlainObject(schema.field)) {
                return cast;
            }

            const value = R.isNumber(schema.field.step)
                ? roundToStep(cast, schema.field.step)
                : cast;

            return Math.clamp(value, schema.field.min ?? -Infinity, schema.field.max ?? Infinity);
        }

        case "text":
        case "uuid": {
            return cast.trim();
        }

        case "select": {
            return getSelectOption(schema.field, cast) ? cast.trim() : getDefaultInputValue(schema);
        }
    }

    return cast;
}

function segmentEntryId(id: NodeEntryId): SegmentedEntryId {
    const [nodeId, category, key] = id.split(".");
    return { nodeId, category, key } as SegmentedEntryId;
}

function isNonNullNodeEntryType(type: NodeEntryType): type is NonNullNodeEntryType {
    return NONNULL_NODE_ENTRY_TYPES.includes(type as any);
}

function isValidCustomEntry(type: NonNullable<NodeEntryType>, value: any) {
    return (
        (isNonNullNodeEntryType(type) && value.constructor === NODE_ENTRY_VALUE_TYPE[type]) ||
        R.isPlainObject(value)
    );
}

function isNonNullNodeEntry<T extends NodeSchemaInput | NodeSchemaBridge>(
    entry: T
): entry is NonNullNodeEntry<Exclude<T, NodeSchemaBridge>> {
    return "type" in entry && isNonNullNodeEntryType(entry.type);
}

function haveSameEntryType(a: { type: NodeEntryType }, b: { type: NodeEntryType }): boolean {
    if (a.type === b.type) {
        return true;
    }

    return (
        isNonNullNodeEntryType(a.type) &&
        isNonNullNodeEntryType(b.type) &&
        NODE_ENTRY_VALUE_TYPE[a.type] === NODE_ENTRY_VALUE_TYPE[b.type]
    );
}

function haveConvertableEntryType(a: { type: NodeEntryType }, b: { type: NodeEntryType }): boolean {
    return !!a.type && !!b.type && !!NODE_ENTRY_CONVERTABLE_TYPE[a.type]?.includes(b.type);
}

function haveCompatibleEntryType(a: { type: NodeEntryType }, b: { type: NodeEntryType }): boolean {
    return haveSameEntryType(a, b) || haveConvertableEntryType(a, b);
}

export {
    NODE_ENTRY_CATEGORIES,
    NODE_ENTRY_TYPES,
    NODE_ENTRY_VALUE_TYPE,
    NONNULL_NODE_ENTRY_TYPES,
    getDefaultInputValue,
    getNodeEntryValueList,
    getSelectOption,
    getSelectOptions,
    haveCompatibleEntryType,
    haveConvertableEntryType,
    haveSameEntryType,
    isEntryId,
    isNonNullNodeEntry,
    isNonNullNodeEntryType,
    isValidCustomEntry,
    processDataInputs,
    processDataOutputs,
    segmentEntryId,
    setToSchemaValue,
};
