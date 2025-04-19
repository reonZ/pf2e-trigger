import { NodeEntryType, NodeType, NonBridgeEntry } from "data";
import { R } from "module-helpers";
import { action, condition, event, eventSchema, NodeSchemaModel, NodeSchemaSource } from "schema";

const RAW_SCHEMAS = {
    event,
    action,
    condition,
    logic: {},
    splitter: {},
    value: {},
    variable: {
        getter: {},
        setter: {},
    },
    macro: {},
    subtrigger: {
        "subtrigger-input": eventSchema,
    },
} satisfies Record<NodeType, Record<string, NodeRawSchema>>;

const NODE_KEYS = R.pipe(
    RAW_SCHEMAS,
    R.values(),
    R.flatMap((x) => R.keys(x))
);

const EVENT_KEYS = R.keys(RAW_SCHEMAS.event);

function getRawSchema(type: NodeType, key: NodeKey): NodeRawSchema | undefined {
    // @ts-expect-error
    return foundry.utils.deepClone(RAW_SCHEMAS[type]?.[key]);
}

function getSchema({ type, key }: { type: NodeType; key: NodeKey }): NodeSchemaModel | undefined {
    const raw = getRawSchema(type, key) as DeepPartial<NodeSchemaSource>;
    return new NodeSchemaModel(raw);
}

function isValidNodeKey(type: NodeType, key: NodeKey): boolean {
    return key in (RAW_SCHEMAS[type] ?? {});
}

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

type NodeSchemaVariable = NodeRawSchemaEntry<NonBridgeEntry>;

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
    TType extends NonBridgeEntry,
    TField extends Record<string, any> | never = never
> = NodeRawSchemaEntry<TType> & {
    connection?: boolean;
    field?: TField extends Record<string, any> ? TField : never;
};

type NodeSchemaInputEntryWithField<
    TType extends NonBridgeEntry,
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
        default?: string;
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

export { EVENT_KEYS, getSchema, isValidNodeKey, NODE_KEYS };
export type { EventKey, NodeKey, NodeRawSchema, NodeRawSchemaEntry };
