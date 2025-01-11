import { BlueprintNode } from "@blueprint/node/blueprint-node";
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

    get name(): string {
        return this.#data.name;
    }

    get eventNode(): TriggerNode {
        return this.#data.event;
    }

    *nodes(): Generator<TriggerNode, void, undefined> {
        for (const node of Object.values(this.#data.nodes)) {
            yield node;
        }
    }

    addNode(node: TriggerNode) {
        this.#data.nodes[node.id] = node;
    }

    *removeNode(idOrNode: string | BlueprintNode | TriggerNode) {
        const triggerNode =
            idOrNode instanceof BlueprintNode
                ? idOrNode.trigger
                : idOrNode instanceof TriggerNode
                ? idOrNode
                : this.#data.nodes[idOrNode];

        delete this.#data.nodes[triggerNode.id];

        for (const [thisEntryId, otherEntryId] of triggerNode.removeConnections()) {
            const { nodeId, category, key } = Trigger.segmentEntryId(otherEntryId);
            const otherNode = this.#data.nodes[nodeId];
            if (!otherNode) continue;

            otherNode.removeConnection(category, key, thisEntryId);

            yield [thisEntryId, otherEntryId];
        }
    }

    getNodes(): TriggerNode[] {
        return Object.values(this.#data.nodes);
    }
}

function createTrigger(data: Maybe<TriggerDataRaw>): Trigger | null {
    if (!R.isPlainObject(data) || !R.isString(data.id) || !R.isString(data.name)) {
        return null;
    }

    const uniques: Set<string> = new Set();
    let event: TriggerNode | undefined;

    const nodes = R.pipe(
        R.isArray(data.nodes) ? data.nodes : [],
        R.map((node) => {
            const trigger = createTriggerNode(node);

            if (!trigger?.isUnique) {
                return trigger;
            }

            if (trigger.type === "event") {
                if (event) return;
                event = trigger;
            }

            const uniqueId = `${trigger.type}-${trigger.key}`;
            if (uniques.has(uniqueId)) return;

            uniques.add(uniqueId);
            return trigger;
        }),
        R.filter(R.isTruthy),
        R.mapToObj((node) => [node.id, node])
    );

    if (!event) {
        return null;
    }

    return new Trigger({
        id: data.id,
        name: data.name,
        nodes,
        event,
    });
}

type TriggerDataRaw = Omit<TriggerData, "nodes" | "event"> & {
    nodes: NodeDataRaw[];
};

type BaseTriggerData = {
    id: string;
    name: string;
};

type TriggerData = BaseTriggerData & {
    nodes: Record<string, TriggerNode>;
    event: TriggerNode;
};

type SegmentedEntryId = {
    nodeType: NodeType;
    nodeId: string;
    category: NodeEntryCategory;
    key: string;
};

export { Trigger, createTrigger };
export type { TriggerDataRaw };
