import { R } from "module-helpers";
import { processCustomSchema } from "schema/schema";
import { isNodeKey } from "schema/schema-list";
import { processDataInputs, processDataOutputs } from "./data-entry";

const CUSTOM_TYPES = ["macro", "subtrigger"] as const;

const NODE_TYPES = [
    "event",
    "action",
    "condition",
    "logic",
    "splitter",
    "value",
    "converter",
    "variable",
    "setter",
    ...CUSTOM_TYPES,
] as const;

const NODE_TYPES_INDEX = R.mapToObj(NODE_TYPES, (type, index) => [type, index]);

function processNodeData(data: NodeRawData): NodeData | null {
    if (
        !R.isPlainObject(data) ||
        !R.isString(data.id) ||
        !isNodeType(data.type) ||
        !isNodeKey(data.type, data.key) ||
        !R.isNumber(data.x) ||
        !R.isNumber(data.y)
    ) {
        return null;
    }

    const inputs = processDataInputs(data);
    const outputs = processDataOutputs(data);
    const custom = processCustomSchema(data.custom);

    return {
        id: data.id,
        key: data.key,
        type: data.type,
        x: data.x,
        y: data.y,
        inputs,
        outputs,
        subId: data.subId,
        custom,
    };
}

function isNodeType(type: any): type is NodeType {
    return R.isString(type) && NODE_TYPES.includes(type as NodeType);
}

function isEventNode(node: NodeData): boolean {
    return node.type === "event" || (node.type === "subtrigger" && node.key === "subtrigger-input");
}

function isCustomNodeType(type: NodeType): type is CustomNodeType {
    return CUSTOM_TYPES.includes(type as CustomNodeType);
}

export {
    CUSTOM_TYPES,
    NODE_TYPES,
    NODE_TYPES_INDEX,
    isCustomNodeType,
    isEventNode,
    isNodeType,
    processNodeData,
};
