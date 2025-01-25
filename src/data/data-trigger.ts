import { R } from "module-helpers";
import { NodeEntryId } from "./data-entry";
import { NodeData, NodeRawData, processNodeData } from "./data-node";
import { NodeType } from "schema/schema";

const NODE_TYPE_ORDER: Record<NodeType, number> = {
    event: 0,
    condition: 1,
    action: 2,
    logic: 3,
    value: 4,
    variable: 5,
};

function processTriggerData(triggerData: Maybe<TriggerRawData>): TriggerData | null {
    if (!R.isPlainObject(triggerData)) {
        return null;
    }

    let event: NodeData | undefined;

    const nodes: TriggerData["nodes"] = R.pipe(
        triggerData.nodes ?? [],
        R.map((nodeData) => {
            const node = processNodeData(nodeData);

            if (node?.type === "event") {
                if (event) return null;
                event = node;
            }

            return node;
        }),
        R.filter(R.isTruthy),
        R.mapToObj((node) => [node.id, node])
    );

    if (!event) {
        return null;
    }

    for (const node of R.values(nodes)) {
        for (const category of ["inputs", "outputs"] as const) {
            for (const [key, entry] of R.entries(node[category])) {
                if (!entry.ids) continue;

                const originId = `${node.id}.${category}.${key}` as NodeEntryId;

                for (const targetId of entry.ids) {
                    const targetIds = fu.getProperty(nodes, `${targetId}.ids`);
                    if (!R.isArray(targetIds) || targetIds.includes(originId)) continue;

                    node[category][key].ids?.findSplice((x) => x === targetId);
                }
            }
        }
    }

    const id = R.isString(triggerData.id) ? triggerData.id : fu.randomID();

    return {
        id,
        name: triggerData.name?.trim() || id,
        nodes,
        event,
    };
}

function serializeTrigger(trigger: WithPartial<TriggerData, "id">): TriggerRawData {
    const nodes = R.pipe(
        R.values(trigger.nodes),
        R.sortBy((node) => NODE_TYPE_ORDER[node.type])
    );

    return {
        id: trigger.id,
        name: trigger.name,
        nodes: fu.deepClone(nodes),
    };
}

type TriggerData = BaseTriggerData & {
    nodes: Record<string, NodeData>;
    event: NodeData;
};

type TriggerRawData = Partial<
    BaseTriggerData & {
        nodes: NodeRawData[];
    }
>;

type BaseTriggerData = {
    id: string;
    name: string;
};

export { processTriggerData, serializeTrigger };
export type { TriggerData, TriggerRawData };
