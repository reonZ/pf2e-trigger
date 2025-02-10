import { R } from "module-helpers";
import { processCustomSchema } from "schema/schema";
import { processDataInputs, processDataOutputs } from "./data-entry";
import { isNodeKey } from "schema/schema-list";

const CUSTOM_TYPES = ["macro", "subtrigger"] as const;

const NODE_TYPES = [
    ...CUSTOM_TYPES,
    "event",
    "condition",
    "value",
    "action",
    "logic",
    "variable",
    "converter",
    "splitter",
] as const;

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

export { CUSTOM_TYPES, NODE_TYPES, isCustomNodeType, isEventNode, isNodeType, processNodeData };
