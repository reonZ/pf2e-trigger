import { NodeEntryType } from "@data/data-entry";
import { R } from "module-helpers";

const NODE_TYPES = ["event", "condition", "value"] as const;
// const NODE_TYPES = ["event", "condition", "value", "action", "logic"] as const;

function isNodeType(type: any): type is NodeType {
    return R.isString(type) && NODE_TYPES.includes(type as NodeType);
}

type NodeType = (typeof NODE_TYPES)[number];

type NodeSchemaEntry = {
    key: string;
    label?: string;
    type?: NodeEntryType;
};

type NodeSchema = {
    isUnique?: boolean;
    inputs?: NodeSchemaEntry[];
    outputs: NodeSchemaEntry[];
};

export type { NodeSchema, NodeType, NodeEntryType, NodeSchemaEntry };
export { isNodeType };
