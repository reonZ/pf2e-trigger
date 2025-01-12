import { NodeType, isNodeType } from "@schema/schema";
import { isNodeKey } from "@schema/schema-list";
import { R } from "module-helpers";
import { NodeEntryMap, processEntryDataMap } from "./data-entry";

// abstract class TriggerNode {
//     #data: NodeData;
//     #schema: NodeSchema;

//     constructor(data: NodeData) {
//         this.#data = data;
//         this.#schema = getSchema(data);
//     }

//     get isUnique(): boolean {
//         return !!this.#schema.isUnique;
//     }
// }

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

    const inputs = processEntryDataMap(data.inputs);
    const outputs = processEntryDataMap(data.outputs);

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

type NodeEntryValue = string | number | undefined;

export { processNodeData };
export type { NodeData, NodeEntryValue, NodeRawData };
