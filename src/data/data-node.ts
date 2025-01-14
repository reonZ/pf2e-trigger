import { NodeType, isNodeType } from "@schema/schema";
import { getSchema, isNodeKey } from "@schema/schema-list";
import { R } from "module-helpers";
import { NodeEntryMap, processInputEntryData, processOutputEntryData } from "./data-entry";

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

    const schema = getSchema({ type: data.type, key: data.key });

    const inputs = processInputEntryData(data.inputs, schema.inputs);
    const outputs = processOutputEntryData(data.outputs);

    return {
        id: data.id,
        key: data.key,
        type: data.type,
        x: data.x,
        y: data.y,
        inputs,
        outputs,
    };
}

type NodeData<T extends NodeType = NodeType> = BaseNodeData<T> & {
    inputs: NodeEntryMap;
    outputs: NodeEntryMap;
};

type NodeRawData<T extends NodeType = NodeType> = MaybePartial<
    BaseNodeData<T> & {
        inputs: NodeEntryMap;
        outputs: NodeEntryMap;
    }
>;

type BaseNodeData<T extends NodeType = NodeType> = {
    id: string;
    type: T;
    key: string;
    x: number;
    y: number;
};

type NodeEntryValue = string | number | boolean | undefined;

export { processNodeData };
export type { NodeData, NodeEntryValue, NodeRawData };
