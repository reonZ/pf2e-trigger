import { isFieldConnection } from "@blueprint/node/node-entry";
import { R } from "module-helpers";
import { HasItemConditionTriggerNode } from "./condition/has-item";
import { EndTurnEventTriggerNode, StartTurnEventTriggerNode } from "./event/turn";
import {
    NODE_ENTRY_CATEGORIES,
    NODE_TYPES,
    NodeData,
    NodeDataEntry,
    NodeDataRaw,
    NodeEntryCategory,
    NodeEntryId,
    NodeEntryIdMap,
    NodeEntryMap,
    NodeType,
    TriggerNode,
} from "./trigger-node";
import { ItemSourceValueTriggerNode } from "./value/item-source";

const NODES: Record<NodeType, Record<string, typeof TriggerNode>> = {
    action: {
        // "": ActionTriggerNode,
    },
    condition: {
        "has-item": HasItemConditionTriggerNode,
    },
    event: {
        "turn-start": StartTurnEventTriggerNode,
        "turn-end": EndTurnEventTriggerNode,
    },
    logic: {
        // "": LogicTriggerNode,
    },
    value: {
        "item-source": ItemSourceValueTriggerNode,
    },
};

const FILTERS: NodeFilter[] = R.pipe(
    NODES,
    R.entries(),
    R.flatMap(([type, nodes]) => {
        return R.entries(nodes).map(([key, node]) => {
            const schema = node.schema;

            const inputs = R.pipe(
                schema.inputs ?? [],
                R.filter((input) => !input.type || !isFieldConnection(input.type)),
                R.map((input) => input.type),
                R.unique()
            );

            const outputs = R.pipe(
                schema.outputs,
                R.map((output) => output.type),
                R.unique()
            );

            return {
                type,
                key,
                inputs,
                outputs,
            };
        });
    }),
    R.filter(({ type }) => type !== "event")
);

function getNodesFilters(): NodeFilter[] {
    return FILTERS;
}

function getEventNodeKeys(): string[] {
    return R.keys(NODES.event);
}

function createTriggerNode(data: Maybe<NodeDataRaw>): TriggerNode | null {
    if (
        !R.isPlainObject(data) ||
        !R.isString(data.id) ||
        !isNodeType(data.type) ||
        !R.isString(data.key) ||
        !R.isNumber(data.x) ||
        !R.isNumber(data.y)
    )
        return null;

    const filterEntryMap = (map: MaybePartial<NodeEntryMap>) => {
        return R.pipe(
            (R.isPlainObject(map) ? map : {}) as NodeEntryMap,
            R.entries(),
            R.filter(([_, entry]) => isNodeEntry(entry)),
            R.map(processEntry),
            R.mapToObj(R.identity())
        );
    };

    const inputs = filterEntryMap(data.inputs);
    const outputs = filterEntryMap(data.outputs);

    const nodeData: NodeData = {
        id: data.id,
        key: data.key,
        type: data.type,
        x: data.x,
        y: data.y,
        inputs,
        outputs,
    };

    // @ts-expect-error
    return new NODES[data.type][data.key](nodeData);
}

function processEntry([key, { ids, value }]: [string, NodeDataEntry]): [string, NodeDataEntry] {
    const entry = R.isPlainObject(ids) ? { ids: processEntryIds(ids) } : { value };
    return [key, entry];
}

function processEntryIds(ids: MaybePartial<NodeEntryIdMap>): NodeEntryIdMap {
    if (!R.isPlainObject(ids)) return {};

    return R.pipe(
        R.entries(ids),
        R.filter(
            (entry): entry is [NodeEntryId, boolean] =>
                isEntryId(entry[0]) && R.isBoolean(entry[1]) && entry[1]
        ),
        R.mapToObj(R.identity())
    );
}

function isNodeEntry(data: MaybePartial<NodeDataEntry>): data is NodeDataEntry {
    if (!R.isPlainObject(data)) return false;
    return (
        (R.isNullish(data.ids) && (R.isString(data.value) || R.isNumber(data.value))) ||
        (R.isNullish(data.value) && R.isPlainObject(data.ids))
    );
}

function isEntryId(id: Maybe<NodeEntryId | string>): id is NodeEntryId {
    if (!R.isString(id)) return false;

    const seg = id.split(".");
    return isNodeType(seg[0]) && isEntryCategory(seg[2]) && !!seg[3];
}

function isEntryCategory(
    category: Maybe<NodeEntryCategory | string>
): category is NodeEntryCategory {
    return R.isString(category) && NODE_ENTRY_CATEGORIES.includes(category as NodeEntryCategory);
}

function isNodeType(type: Maybe<NodeType | string>): type is NodeType {
    return R.isString(type) && NODE_TYPES.includes(type as NodeType);
}

type NodeFilter = {
    type: "event" | "condition" | "value" | "action" | "logic";
    key: string;
    inputs: ("boolean" | "item" | "uuid" | "text" | undefined)[];
    outputs: ("boolean" | "item" | "uuid" | "text" | undefined)[];
};

export { createTriggerNode, getEventNodeKeys, getNodesFilters };
