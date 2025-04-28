import { NodeEntryType, NodeType, NonBridgeEntryType, TriggerNodeData } from "data";
import { R } from "module-helpers";
import {
    action,
    condition,
    event,
    NodeSchemaModel,
    NodeSchemaSource,
    value,
    variable,
} from "schema";

const fakeSchema = {} satisfies NodeRawSchema;

const SCHEMAS = {
    event,
    action,
    condition,
    logic: {
        "eq-number": fakeSchema,
    },
    splitter: {
        "boolean-splitter": fakeSchema,
    },
    value,
    variable,
    macro: {
        "use-macro": fakeSchema,
    },
    subtrigger: {
        "subtrigger-input": fakeSchema,
        "subtrigger-output": fakeSchema,
        "subtrigger-node": fakeSchema,
    },
} as const satisfies Record<NodeType, Record<string, NodeRawSchema>>;

const NODE_KEYS = R.pipe(
    SCHEMAS,
    R.values(),
    R.flatMap((x) => R.keys(x))
);

const EVENT_KEYS = R.keys(SCHEMAS.event);

function getSchema(
    data: { type: NodeType; key: NodeKey } | TriggerNodeData
): NodeSchemaModel | undefined {
    const schema = foundry.utils.deepClone(
        // @ts-ignore
        SCHEMAS[data.type]?.[data.key]
    ) as DeepPartial<NodeSchemaSource>;

    if (data instanceof TriggerNodeData && data._source.custom) {
        (schema.inputs ??= []).push(...(data._source.custom.inputs ?? []));
        (schema.outputs ??= []).push(...(data._source.custom.outputs ?? []));
    }

    return schema ? new NodeSchemaModel(schema) : undefined;
}

function isValidNodeKey(type: NodeType, key: NodeKey): boolean {
    return key in (SCHEMAS[type] ?? {});
}

function isValue({ type }: NodeAdjacent): boolean {
    return type === "value";
}

function isEvent({ type }: NodeAdjacent): boolean {
    return type === "event";
}

function isVariable({ type }: NodeAdjacent): boolean {
    return type === "variable";
}

function isSubtrigger({ type, key }: NodeAdjacent) {
    return type === "subtrigger" && key === "subtrigger-node";
}

function isGetter(node: NodeAdjacent): boolean {
    return isVariable(node) && node.key === "variable-getter";
}

function isSubTrigger({ type }: NodeAdjacent): boolean {
    return type === "subtrigger";
}

function hasInBridge(node: NodeAdjacent): boolean {
    return (
        !isValue(node) &&
        !isEvent(node) &&
        !isGetter(node) &&
        (!isSubTrigger(node) || node.key !== "subtrigger-input")
    );
}

function hasOuts(node: NodeAdjacent): boolean {
    return !isValue(node) && !isGetter(node);
}

function hasInputConnector(node: NodeAdjacent) {
    return !isEvent(node) && !isValue(node);
}

type NodeAdjacent = { type: NodeType; key: NodeKey };

type NodeKey = (typeof NODE_KEYS)[number];
type EventKey = (typeof EVENT_KEYS)[number];

type NodeRawSchema = Omit<DeepPartial<NodeSchemaSource>, "outs" | "inputs" | "outputs"> & {
    outs?: ReadonlyArray<NodeSchemaRawBridge>;
    inputs?: ReadonlyArray<NodeSchemaInput>;
    outputs?: ReadonlyArray<NodeSchemaVariable>;
};

type NodeRawSchemaEntry<T extends NodeEntryType> = {
    key: string;
    label?: string;
    group?: string;
    type: T;
};

type NodeSchemaBridge = NodeRawSchemaEntry<"bridge">;
type NodeSchemaRawBridge = WithPartial<NodeSchemaBridge, "type">;

type NodeSchemaVariable = NodeRawSchemaEntry<NonBridgeEntryType>;

type NodeSchemaInput =
    | NodeSchemaText
    | NodeSchemaNumber
    | NodeSchemaBoolean
    | NodeSchemaTarget
    | NodeSchemaItem
    | NodeSchemaRoll
    | NodeSchemaDc
    | NodeSchemaDuration
    | NodeSchemaList
    | NodeSchemaSelect;

type NodeSchemaInputEntry<
    TType extends NonBridgeEntryType,
    TField extends Record<string, any> | never = never
> = NodeRawSchemaEntry<TType> & {
    connection?: boolean;
    field?: TField extends Record<string, any> ? TField : never;
};

type NodeSchemaInputEntryWithField<
    TType extends NonBridgeEntryType,
    TField extends Record<string, any>
> = Omit<NodeSchemaInputEntry<TType>, "field"> & { field: TField };

type NodeSchemaNumber = NodeSchemaInputEntry<
    "number",
    {
        min?: number;
        max?: number;
        step?: number;
        default?: number;
    }
>;

type NodeSchemaBoolean = NodeSchemaInputEntry<
    "boolean",
    {
        default?: boolean;
    }
>;

type NodeSchemaText = NodeSchemaInputEntry<
    "text",
    {
        code?: boolean;
    }
>;

type NodeSchemaSelect = NodeSchemaInputEntryWithField<
    "select",
    {
        default?: string;
        options: (string | SelectOption)[] | string;
    }
>;

type NodeSchemaTarget = NodeSchemaInputEntry<"target">;
type NodeSchemaItem = NodeSchemaInputEntry<"item">;
type NodeSchemaRoll = NodeSchemaInputEntry<"roll">;
type NodeSchemaDc = NodeSchemaInputEntry<"dc">;
type NodeSchemaDuration = NodeSchemaInputEntry<"duration">;
type NodeSchemaList = NodeSchemaInputEntry<"list">;

type SchemaEntries = {
    select: SelectEntrySchema;
    number: NodeSchemaNumber;
    text: NodeSchemaText;
};

type SelectEntrySchema = NodeSchemaInputEntryWithField<
    "select",
    {
        default?: string;
        options: Required<SelectOption>[];
    }
>;

export {
    EVENT_KEYS,
    getSchema,
    hasInBridge,
    hasInputConnector,
    hasOuts,
    isEvent,
    isGetter,
    isSubtrigger,
    isValidNodeKey,
    isValue,
    isVariable,
    NODE_KEYS,
    SCHEMAS,
};
export type {
    EventKey,
    NodeKey,
    NodeRawSchema,
    NodeRawSchemaEntry,
    NodeSchemaNumber,
    SchemaEntries,
    SelectEntrySchema,
};
