import { NodeEntryType, NodeType, NonBridgeEntryType, TriggerNodeData } from "data";
import { R } from "module-helpers";
import {
    action,
    BaseNodeSchemaEntry,
    condition,
    event,
    IconObject,
    logic,
    NodeSchemaCustom,
    NodeSchemaModel,
    NodeSchemaModuleId,
    NodeTextInputType,
    splitter,
    subtrigger,
    value,
    variable,
} from "schema";

const SCHEMAS = {
    event,
    action,
    condition,
    logic,
    splitter,
    value,
    variable,
    subtrigger,
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
    );

    if (!schema) return;

    if (!(data instanceof TriggerNodeData)) {
        return new NodeSchemaModel(schema);
    }

    if (data._source.custom) {
        (schema.outs ??= []).push(...(data._source.custom.outs ?? []));
        (schema.inputs ??= []).push(...(data._source.custom.inputs ?? []));
        (schema.outputs ??= []).push(...(data._source.custom.outputs ?? []));
    }

    if (data.isSubtriggerNode && data.target && data.triggers) {
        const origin = data.triggers.get(data.target);
        const input = origin?.event;
        const output = origin?.nodes.find(isSubtriggerOutput);

        (schema.inputs ??= []).push(...(input?._source.custom?.outputs ?? []));
        (schema.outputs ??= []).push(...(output?._source.custom?.inputs ?? []));
    }

    return new NodeSchemaModel(schema);
}

function isValidNodeKey(type: NodeType, key: NodeKey): boolean {
    return key in (SCHEMAS[type] ?? {});
}

function isValue({ type }: NodeAdjacent): boolean {
    return type === "value";
}

function isEvent(node: NodeAdjacent): boolean {
    return node.type === "event" || isSubtriggerEvent(node);
}

function isVariable({ type }: NodeAdjacent): boolean {
    return type === "variable";
}

function isSubtriggerEvent(node: NodeAdjacent): boolean {
    return isSubTrigger(node) && node.key === "subtrigger-input";
}

function isSubtriggerNode(node: NodeAdjacent): boolean {
    return isSubTrigger(node) && node.key === "subtrigger-node";
}

function isSubtriggerOutput(node: NodeAdjacent): boolean {
    return isSubTrigger(node) && node.key === "subtrigger-output";
}

function isBreakProcess({ key, type }: NodeAdjacent): boolean {
    return type === "action" && key === "break-process";
}

function isGetter(node: NodeAdjacent): boolean {
    return isVariable(node) && node.key === "variable-getter";
}

function isSubTrigger({ type }: NodeAdjacent): boolean {
    return type === "subtrigger";
}

function hasInBridge(node: NodeAdjacent): boolean {
    return !isValue(node) && !isEvent(node) && !isGetter(node);
}

function hasOuts(node: NodeAdjacent): boolean {
    return !isValue(node) && !isGetter(node) && !isSubtriggerOutput(node) && !isBreakProcess(node);
}

function hasInputConnector(node: NodeAdjacent, schema: NodeSchemaModel) {
    return !isEvent(node) && (!isValue(node) || schema.inputs.length > 1);
}

type NodeAdjacent = { type: NodeType; key: NodeKey };

type NodeKey = (typeof NODE_KEYS)[number];
type NodeEventKey = (typeof EVENT_KEYS)[number] | "subtrigger-input";
type NonEventKey = Exclude<NodeKey, NodeEventKey>;

type NodeKeys<T extends NodeType> = keyof (typeof SCHEMAS)[T];

type NodeRawSchema = {
    await?: boolean;
    custom?: ReadonlyArray<NodeSchemaCustom>;
    document?: string;
    icon?: string | IconObject;
    image?: string;
    inputs?: ReadonlyArray<NodeSchemaInput>;
    loop?: boolean;
    module?: NodeSchemaModuleId;
    outputs?: ReadonlyArray<NodeSchemaOutput>;
    outs?: ReadonlyArray<NodeSchemaRawBridge>;
};

type NodeRawSchemaEntry<T extends NodeEntryType> = BaseNodeSchemaEntry<T>;

type NodeSchemaBridge = NodeRawSchemaEntry<"bridge">;
type NodeSchemaRawBridge = WithPartial<NodeSchemaBridge, "type">;

type NodeSchemaOutput = NodeRawSchemaEntry<NonBridgeEntryType>;

type NodeSchemaInput =
    | NodeSchemaBoolean
    | NodeSchemaDc
    | NodeSchemaDuration
    | NodeSchemaEffect
    | NodeSchemaItem
    | NodeSchemaList
    | NodeSchemaNumber
    | NodeSchemaRoll
    | NodeSchemaSelect
    | NodeSchemaTarget
    | NodeSchemaText
    | NodeSchemaUuid
    | NodeSchemaObject;

type NodeSchemaInputEntry<
    TType extends NonBridgeEntryType,
    TField extends Record<string, any> | never = never
> = NodeRawSchemaEntry<TType> & {
    field?: TField extends Record<string, any> ? TField : never;
};

type NodeSchemaInputEntryWithField<
    TType extends NonBridgeEntryType,
    TField extends Record<string, any>
> = Omit<NodeSchemaInputEntry<TType>, "field"> & {
    field: TField;
};

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
        type?: NodeTextInputType;
        default?: string;
        trim?: boolean;
    }
>;

type NodeSchemaSelect = NodeSchemaInputEntryWithField<
    "select",
    {
        default?: string;
        options: (string | SelectOption)[] | string;
    }
>;

type NodeSchemaUuid = NodeSchemaInputEntryWithField<
    "uuid",
    {
        document: "Item" | "Macro";
    }
>;

type NodeSchemaDc = NodeSchemaInputEntry<"dc">;
type NodeSchemaDuration = NodeSchemaInputEntry<"duration">;
type NodeSchemaEffect = NodeSchemaInputEntry<"effect">;
type NodeSchemaItem = NodeSchemaInputEntry<"item">;
type NodeSchemaList = NodeSchemaInputEntry<"list">;
type NodeSchemaRoll = NodeSchemaInputEntry<"roll">;
type NodeSchemaTarget = NodeSchemaInputEntry<"target">;
type NodeSchemaObject = NodeSchemaInputEntry<"object">;

type SchemaEntries = {
    select: SelectEntrySchema;
    number: NodeSchemaNumber;
    text: NodeSchemaText;
    uuid: NodeSchemaUuid;
};

type SelectEntrySchema = NodeSchemaInputEntryWithField<
    "select",
    {
        default?: string;
        options: Required<SelectOption>[];
    }
>;

type NodeSchemaOf<T extends NodeType, K extends keyof (typeof SCHEMAS)[T]> = (typeof SCHEMAS)[T][K];

export {
    EVENT_KEYS,
    getSchema,
    hasInBridge,
    hasInputConnector,
    hasOuts,
    isEvent,
    isGetter,
    isSubtriggerEvent,
    isSubtriggerNode,
    isSubtriggerOutput,
    isValidNodeKey,
    isValue,
    isVariable,
    NODE_KEYS,
    SCHEMAS,
};
export type {
    NodeEventKey,
    NodeKey,
    NodeKeys,
    NodeRawSchema,
    NodeRawSchemaEntry,
    NodeSchemaBoolean,
    NodeSchemaInput,
    NodeSchemaNumber,
    NodeSchemaOf,
    NodeSchemaRawBridge,
    NodeSchemaSelect,
    NodeSchemaUuid,
    NodeSchemaOutput,
    NonEventKey,
    SchemaEntries,
    SelectEntrySchema,
};
