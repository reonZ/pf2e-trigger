import {
    NodeDataRaw,
    NodeEntryCategory,
    NodeEntryId,
    NodeType,
    TriggerNode,
} from "@node/trigger-node";
import { createTriggerNode } from "@node/trigger-nodes-list";
import { R } from "module-helpers";

class Trigger {
    #data: TriggerData;

    constructor(data: TriggerData) {
        this.#data = data;
    }

    static segmentEntryId(id: NodeEntryId): SegmentedEntryId {
        const seg = id.split(".");

        return {
            nodeType: seg[0] as NodeType,
            nodeId: seg[1],
            category: seg[2] as NodeEntryCategory,
            key: seg[3],
        };
    }

    get id(): string {
        return this.#data.id;
    }

    *nodes(): Generator<TriggerNode, void, undefined> {
        for (const node of Object.values(this.#data.nodes)) {
            yield node;
        }
    }
}

function createTrigger(data: Maybe<TriggerDataRaw>): Trigger | null {
    if (!R.isPlainObject(data) || !R.isString(data.id) || !R.isString(data.name)) return null;

    const nodes = R.pipe(
        R.isArray(data.nodes) ? data.nodes : [],
        R.map(createTriggerNode),
        R.filter(R.isTruthy),
        R.mapToObj((node) => [node.id, node])
    );

    return new Trigger({
        id: data.id,
        name: data.name,
        nodes,
    });
}

type TriggerDataRaw = Omit<TriggerData, "nodes"> & {
    nodes: NodeDataRaw[];
};

type BaseTriggerData = {
    id: string;
    name: string;
};

type TriggerData = BaseTriggerData & {
    nodes: Record<string, TriggerNode>;
};

type SegmentedEntryId = {
    nodeType: NodeType;
    nodeId: string;
    category: NodeEntryCategory;
    key: string;
};

export { Trigger, createTrigger };
export type { TriggerDataRaw };
